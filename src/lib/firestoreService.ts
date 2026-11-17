import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  DEFAULT_EMPREENDIMENTOS,
  DEFAULT_LANDING_PAGE,
  DEFAULT_MEDIA_ASSETS,
  DEFAULT_PROFESSIONAL_PROFILE,
  DEFAULT_PROPERTIES,
  DEFAULT_SITE_SETTINGS,
  resolveLocalAssetUrl,
} from './seedData';
import { calculateLeadScore, generateFirestoreId, sanitizeStr, slugify } from './utils';
import { getStoredUtmParams } from './analytics';
import type {
  AdminUser,
  AnalyticsEvent,
  Client,
  ClientInteraction,
  Empreendimento,
  LandingPage,
  Lead,
  MediaAsset,
  PipelineDeal,
  ProfessionalProfile,
  Property,
  Proposal,
  SiteSettings,
  Task,
  Visit,
} from '../types';

// --- PUBLIC READS ---

export async function fetchSiteSettings(): Promise<SiteSettings> {
  try {
    const snap = await getDoc(doc(db, 'siteSettings', 'default'));
    if (snap.exists()) {
      const data = snap.data() as SiteSettings;
      return {
        id: snap.id,
        ...data,
        logoUrl: resolveLocalAssetUrl(data.logoUrl) || DEFAULT_SITE_SETTINGS.logoUrl,
        heroImage: resolveLocalAssetUrl(data.heroImage) || DEFAULT_SITE_SETTINGS.heroImage,
      };
    }
    return DEFAULT_SITE_SETTINGS;
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

export async function fetchProfessionalProfile(): Promise<ProfessionalProfile> {
  try {
    const snap = await getDoc(doc(db, 'professionalProfile', 'bruno-diniz'));
    if (snap.exists()) {
      const data = snap.data() as ProfessionalProfile;
      return {
        id: snap.id,
        ...data,
        portraitImage:
          resolveLocalAssetUrl(data.portraitImage) || DEFAULT_PROFESSIONAL_PROFILE.portraitImage,
      };
    }
    return DEFAULT_PROFESSIONAL_PROFILE;
  } catch {
    return DEFAULT_PROFESSIONAL_PROFILE;
  }
}

export async function fetchPublishedProperties(): Promise<Property[]> {
  try {
    const q = query(collection(db, 'properties'), where('published', '==', true));
    const snap = await getDocs(q);
    if (snap.empty) {
      return DEFAULT_PROPERTIES;
    }
    return snap.docs.map((d) => {
      const data = d.data() as Omit<Property, 'id'>;
      return {
        id: d.id,
        ...data,
        coverImage: resolveLocalAssetUrl(data.coverImage),
        gallery: (data.gallery || []).map((g) => resolveLocalAssetUrl(g)),
      };
    });
  } catch {
    return DEFAULT_PROPERTIES;
  }
}

export async function fetchPublishedEmpreendimentos(): Promise<Empreendimento[]> {
  try {
    const q = query(collection(db, 'empreendimentos'), where('published', '==', true));
    const snap = await getDocs(q);
    if (snap.empty) {
      return DEFAULT_EMPREENDIMENTOS;
    }
    return snap.docs.map((d) => {
      const data = d.data() as Omit<Empreendimento, 'id'>;
      return {
        id: d.id,
        ...data,
        coverImage: resolveLocalAssetUrl(data.coverImage),
        gallery: (data.gallery || []).map((g) => resolveLocalAssetUrl(g)),
      };
    });
  } catch {
    return DEFAULT_EMPREENDIMENTOS;
  }
}

export async function fetchPublishedLandingPages(): Promise<LandingPage[]> {
  try {
    const q = query(collection(db, 'landingPages'), where('published', '==', true));
    const snap = await getDocs(q);
    if (snap.empty) {
      return [DEFAULT_LANDING_PAGE];
    }
    return snap.docs.map((d) => {
      const data = d.data() as Omit<LandingPage, 'id'>;
      return {
        id: d.id,
        ...data,
        heroImage: resolveLocalAssetUrl(data.heroImage),
        gallery: (data.gallery || []).map((g) => resolveLocalAssetUrl(g)),
      };
    });
  } catch {
    return [DEFAULT_LANDING_PAGE];
  }
}

// --- PUBLIC WRITES (LEADS & VISITS) ---

export async function submitPublicLead(input: {
  name: string;
  phone: string;
  email?: string;
  message?: string;
  source: string;
  propertyId?: string;
  propertyTitle?: string;
  empreendimentoId?: string;
  landingPageId?: string;
  lgpdConsent: boolean;
}): Promise<{ id: string; score: string }> {
  const id = generateFirestoreId('lead');
  const utm = getStoredUtmParams();
  const { score, points, autoTags } = calculateLeadScore({
    email: input.email,
    message: input.message,
    propertyId: input.propertyId,
    empreendimentoId: input.empreendimentoId,
    landingPageId: input.landingPageId,
  });

  const payload = {
    name: sanitizeStr(input.name, 140),
    phone: sanitizeStr(input.phone, 40),
    email: sanitizeStr(input.email, 160),
    message: sanitizeStr(input.message, 2000),
    source: sanitizeStr(input.source || 'site', 80),
    propertyId: sanitizeStr(input.propertyId, 128),
    propertyTitle: sanitizeStr(input.propertyTitle, 180),
    empreendimentoId: sanitizeStr(input.empreendimentoId, 128),
    landingPageId: sanitizeStr(input.landingPageId, 128),
    utmSource: sanitizeStr(utm.utmSource, 100),
    utmMedium: sanitizeStr(utm.utmMedium, 100),
    utmCampaign: sanitizeStr(utm.utmCampaign, 100),
    score,
    scorePoints: points,
    status: 'novo_lead' as const,
    tags: autoTags.slice(0, 10),
    lgpdConsent: Boolean(input.lgpdConsent),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'leads', id), payload);
    return { id, score };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `leads/${id}`);
  }
}

export async function submitPublicVisitRequest(input: {
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  propertyId?: string;
  propertyTitle?: string;
  empreendimentoId?: string;
  scheduledDate: string;
  scheduledTime?: string;
  notes?: string;
}): Promise<string> {
  const visitId = generateFirestoreId('visit');
  const visitPayload = {
    clientName: sanitizeStr(input.clientName, 140),
    clientPhone: sanitizeStr(input.clientPhone, 40),
    clientEmail: sanitizeStr(input.clientEmail, 160),
    propertyId: sanitizeStr(input.propertyId, 128),
    propertyTitle: sanitizeStr(input.propertyTitle, 180),
    empreendimentoId: sanitizeStr(input.empreendimentoId, 128),
    scheduledDate: sanitizeStr(input.scheduledDate, 30),
    scheduledTime: sanitizeStr(input.scheduledTime || 'A confirmar', 20),
    notes: sanitizeStr(input.notes, 1000),
    reminderSent: false,
    status: 'solicitada' as const,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'visits', visitId), visitPayload);
    // Also capture a high-intent Lead automatically
    await submitPublicLead({
      name: input.clientName,
      phone: input.clientPhone,
      email: input.clientEmail,
      message: `Solicitação de visita para ${input.scheduledDate} (${input.scheduledTime || 'horário a confirmar'}). ${input.notes || ''}`,
      source: 'agendamento_visita',
      propertyId: input.propertyId,
      propertyTitle: input.propertyTitle,
      empreendimentoId: input.empreendimentoId,
      lgpdConsent: true,
    });
    return visitId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `visits/${visitId}`);
  }
}

// --- ADMIN SEEDING & CRUD ---

export async function bootstrapInitialFirestoreData(): Promise<void> {
  try {
    const existingSettings = await getDoc(doc(db, 'siteSettings', 'default'));
    if (!existingSettings.exists()) {
      const { id: _sid, ...settingsPayload } = DEFAULT_SITE_SETTINGS;
      await setDoc(doc(db, 'siteSettings', 'default'), {
        ...settingsPayload,
        updatedAt: serverTimestamp(),
      });
    }

    const existingProfile = await getDoc(doc(db, 'professionalProfile', 'bruno-diniz'));
    if (!existingProfile.exists()) {
      const { id: _pid, ...profilePayload } = DEFAULT_PROFESSIONAL_PROFILE;
      await setDoc(doc(db, 'professionalProfile', 'bruno-diniz'), {
        ...profilePayload,
        updatedAt: serverTimestamp(),
      });
    }

    const propsSnap = await getDocs(collection(db, 'properties'));
    if (propsSnap.empty) {
      for (const prop of DEFAULT_PROPERTIES) {
        const { id, ...rest } = prop;
        await setDoc(doc(db, 'properties', id), {
          ...rest,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    }

    const empSnap = await getDocs(collection(db, 'empreendimentos'));
    if (empSnap.empty) {
      for (const emp of DEFAULT_EMPREENDIMENTOS) {
        const { id, ...rest } = emp;
        await setDoc(doc(db, 'empreendimentos', id), {
          ...rest,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    }

    const lpSnap = await getDocs(collection(db, 'landingPages'));
    if (lpSnap.empty) {
      const { id, ...rest } = DEFAULT_LANDING_PAGE;
      await setDoc(doc(db, 'landingPages', id), {
        ...rest,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    const mediaSnap = await getDocs(collection(db, 'media'));
    if (mediaSnap.empty) {
      for (const m of DEFAULT_MEDIA_ASSETS) {
        const { id, ...rest } = m;
        await setDoc(doc(db, 'media', id), {
          ...rest,
          createdAt: serverTimestamp(),
        });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'bootstrap');
  }
}

export async function saveSiteSettings(data: SiteSettings): Promise<void> {
  try {
    const { id: _id, ...clean } = data;
    await setDoc(doc(db, 'siteSettings', 'default'), {
      ...clean,
      brandName: sanitizeStr(clean.brandName, 120),
      tagline: sanitizeStr(clean.tagline, 200),
      creci: sanitizeStr(clean.creci, 60),
      whatsappNumber: sanitizeStr(clean.whatsappNumber, 30),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'siteSettings/default');
  }
}

export async function saveProfessionalProfile(data: ProfessionalProfile): Promise<void> {
  try {
    const { id: _id, ...clean } = data;
    await setDoc(doc(db, 'professionalProfile', 'bruno-diniz'), {
      ...clean,
      name: sanitizeStr(clean.name, 120),
      creci: sanitizeStr(clean.creci, 60),
      headline: sanitizeStr(clean.headline, 220),
      bio: sanitizeStr(clean.bio, 2500),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'professionalProfile/bruno-diniz');
  }
}

export async function saveProperty(prop: Partial<Property> & { id?: string }): Promise<string> {
  const id = prop.id || generateFirestoreId('prop');
  const isNew = !prop.id;
  const title = sanitizeStr(prop.title || 'Imóvel sem título', 180);
  const slug = slugify(prop.slug || title);
  const code = sanitizeStr(prop.code || `BD-${Math.floor(100 + Math.random() * 900)}`, 40).replace(/[^a-zA-Z0-9_-]/g, '');

  const payload: Record<string, unknown> = {
    code,
    slug,
    title,
    businessType: prop.businessType || 'Venda',
    propertyType: prop.propertyType || 'Apartamento',
    category: prop.category || 'Alto Padrão',
    region: sanitizeStr(prop.region || 'Pernambuco', 120),
    neighborhood: sanitizeStr(prop.neighborhood || 'A confirmar', 120),
    address: sanitizeStr(prop.address || 'A confirmar', 240),
    priceConfirmed: Boolean(prop.priceConfirmed),
    price: prop.priceConfirmed && prop.price !== null && prop.price !== undefined ? Number(prop.price) : null,
    condoFeeConfirmed: Boolean(prop.condoFeeConfirmed),
    condoFee: prop.condoFeeConfirmed && prop.condoFee !== null && prop.condoFee !== undefined ? Number(prop.condoFee) : null,
    areaConfirmed: Boolean(prop.areaConfirmed),
    areaSqm: prop.areaConfirmed && prop.areaSqm !== null && prop.areaSqm !== undefined ? Number(prop.areaSqm) : null,
    bedroomsConfirmed: Boolean(prop.bedroomsConfirmed),
    bedrooms: prop.bedroomsConfirmed && prop.bedrooms !== null && prop.bedrooms !== undefined ? Number(prop.bedrooms) : null,
    suites: prop.suites !== null && prop.suites !== undefined ? Number(prop.suites) : null,
    parkingSpots: prop.parkingSpots !== null && prop.parkingSpots !== undefined ? Number(prop.parkingSpots) : null,
    description: sanitizeStr(prop.description || '', 4000),
    features: (prop.features || []).slice(0, 20),
    coverImage: sanitizeStr(prop.coverImage || DEFAULT_PROPERTIES[0].coverImage, 1000),
    gallery: (prop.gallery || []).slice(0, 100),
    featured: Boolean(prop.featured),
    published: prop.published !== undefined ? Boolean(prop.published) : true,
    confirmationStatus: prop.confirmationStatus || 'a_confirmar',
    confirmationNotes: sanitizeStr(prop.confirmationNotes || '', 500),
    empreendimentoId: sanitizeStr(prop.empreendimentoId || '', 128),
    updatedAt: serverTimestamp(),
  };

  try {
    if (isNew) {
      await setDoc(doc(db, 'properties', id), {
        ...payload,
        createdAt: serverTimestamp(),
      });
    } else {
      const existingSnap = await getDoc(doc(db, 'properties', id));
      if (!existingSnap.exists()) {
        await setDoc(doc(db, 'properties', id), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      } else {
        await updateDoc(doc(db, 'properties', id), payload);
      }
    }
    return id;
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, `properties/${id}`);
  }
}

export async function deleteProperty(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'properties', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `properties/${id}`);
  }
}

export async function saveEmpreendimento(emp: Partial<Empreendimento> & { id?: string }): Promise<string> {
  const id = emp.id || generateFirestoreId('emp');
  const isNew = !emp.id;
  const name = sanitizeStr(emp.name || 'Empreendimento', 180);
  const slug = slugify(emp.slug || name);
  const code = sanitizeStr(emp.code || `EMP-${Math.floor(100 + Math.random() * 900)}`, 40).replace(/[^a-zA-Z0-9_-]/g, '');

  const payload: Record<string, unknown> = {
    code,
    slug,
    name,
    developer: sanitizeStr(emp.developer || 'A confirmar', 140),
    category: emp.category || 'Alto Padrão',
    region: sanitizeStr(emp.region || 'Litoral de Pernambuco', 120),
    stage: emp.stage || 'A confirmar',
    priceFromConfirmed: Boolean(emp.priceFromConfirmed),
    priceFrom: emp.priceFromConfirmed && emp.priceFrom !== null && emp.priceFrom !== undefined ? Number(emp.priceFrom) : null,
    areaRange: sanitizeStr(emp.areaRange || 'A confirmar', 80),
    description: sanitizeStr(emp.description || '', 4000),
    amenities: (emp.amenities || []).slice(0, 20),
    coverImage: sanitizeStr(emp.coverImage || DEFAULT_EMPREENDIMENTOS[0].coverImage, 1000),
    gallery: (emp.gallery || []).slice(0, 100),
    featured: Boolean(emp.featured),
    published: emp.published !== undefined ? Boolean(emp.published) : true,
    confirmationStatus: emp.confirmationStatus || 'a_confirmar',
    updatedAt: serverTimestamp(),
  };

  try {
    if (isNew) {
      await setDoc(doc(db, 'empreendimentos', id), {
        ...payload,
        createdAt: serverTimestamp(),
      });
    } else {
      const existingSnap = await getDoc(doc(db, 'empreendimentos', id));
      if (!existingSnap.exists()) {
        await setDoc(doc(db, 'empreendimentos', id), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      } else {
        await updateDoc(doc(db, 'empreendimentos', id), payload);
      }
    }
    return id;
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, `empreendimentos/${id}`);
  }
}

export async function deleteEmpreendimento(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'empreendimentos', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `empreendimentos/${id}`);
  }
}

export async function saveFlagshipLandingPage(lp: Partial<LandingPage> & { id?: string }): Promise<string> {
  // Enforces strictly ONE flagship premium landing page document ('lp-flagship-01' or existing single ID)
  const id = lp.id || 'lp-flagship-01';
  const title = sanitizeStr(lp.title || 'Landing Page Premium', 180);
  const slug = slugify(lp.slug || title);

  const payload: Record<string, unknown> = {
    slug,
    title,
    kicker: sanitizeStr(lp.kicker || 'Seleção Exclusiva · CRECI-PE 21512', 100),
    heroHeadline: sanitizeStr(lp.heroHeadline || title, 200),
    heroSubheadline: sanitizeStr(lp.heroSubheadline || '', 450),
    heroImage: sanitizeStr(lp.heroImage || DEFAULT_LANDING_PAGE.heroImage, 1000),
    targetType: lp.targetType || 'campanha',
    targetId: sanitizeStr(lp.targetId || '', 128),
    highlights: (lp.highlights || []).slice(0, 12),
    gallery: (lp.gallery || []).slice(0, 100),
    ctaLabel: sanitizeStr(lp.ctaLabel || 'Solicitar Atendimento Exclusivo', 80),
    whatsappMessage: sanitizeStr(lp.whatsappMessage || '', 300),
    seoTitle: sanitizeStr(lp.seoTitle || title, 120),
    seoDescription: sanitizeStr(lp.seoDescription || '', 320),
    published: lp.published !== undefined ? Boolean(lp.published) : true,
    updatedAt: serverTimestamp(),
  };

  try {
    const existingSnap = await getDoc(doc(db, 'landingPages', id));
    if (!existingSnap.exists()) {
      await setDoc(doc(db, 'landingPages', id), {
        ...payload,
        createdAt: serverTimestamp(),
      });
    } else {
      await updateDoc(doc(db, 'landingPages', id), payload);
    }
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `landingPages/${id}`);
  }
}

// --- ADMIN CRM OPERATIONS ---

export async function fetchAllAdminCollections() {
  try {
    const [
      propertiesSnap,
      empSnap,
      lpSnap,
      leadsSnap,
      clientsSnap,
      pipelineSnap,
      visitsSnap,
      proposalsSnap,
      tasksSnap,
      mediaSnap,
      analyticsSnap,
      adminUsersSnap,
    ] = await Promise.all([
      getDocs(query(collection(db, 'properties'), orderBy('updatedAt', 'desc'))),
      getDocs(query(collection(db, 'empreendimentos'), orderBy('updatedAt', 'desc'))),
      getDocs(collection(db, 'landingPages')),
      getDocs(query(collection(db, 'leads'), orderBy('createdAt', 'desc'))),
      getDocs(query(collection(db, 'clients'), orderBy('createdAt', 'desc'))),
      getDocs(query(collection(db, 'pipeline'), orderBy('updatedAt', 'desc'))),
      getDocs(query(collection(db, 'visits'), orderBy('createdAt', 'desc'))),
      getDocs(query(collection(db, 'proposals'), orderBy('createdAt', 'desc'))),
      getDocs(query(collection(db, 'tasks'), orderBy('createdAt', 'desc'))),
      getDocs(query(collection(db, 'media'), orderBy('createdAt', 'desc'))),
      getDocs(query(collection(db, 'analytics'), orderBy('createdAt', 'desc'))),
      getDocs(collection(db, 'adminUsers')),
    ]);

    return {
      properties: propertiesSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Property, 'id'>) })),
      empreendimentos: empSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Empreendimento, 'id'>) })),
      landingPages: lpSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<LandingPage, 'id'>) })),
      leads: leadsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Lead, 'id'>) })),
      clients: clientsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Client, 'id'>) })),
      pipeline: pipelineSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PipelineDeal, 'id'>) })),
      visits: visitsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Visit, 'id'>) })),
      proposals: proposalsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Proposal, 'id'>) })),
      tasks: tasksSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Task, 'id'>) })),
      media: mediaSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MediaAsset, 'id'>) })),
      analytics: analyticsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AnalyticsEvent, 'id'>) })),
      adminUsers: adminUsersSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AdminUser, 'id'>) })),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'admin_dashboard');
  }
}

export async function updateLeadAdmin(id: string, lead: Partial<Lead>): Promise<void> {
  try {
    await updateDoc(doc(db, 'leads', id), {
      ...lead,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `leads/${id}`);
  }
}

export async function deleteLeadAdmin(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'leads', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `leads/${id}`);
  }
}

export async function convertLeadToClientAndDeal(lead: Lead): Promise<{ clientId: string; dealId: string }> {
  const clientId = generateFirestoreId('cli');
  const dealId = generateFirestoreId('deal');

  try {
    await setDoc(doc(db, 'clients', clientId), {
      name: sanitizeStr(lead.name, 140),
      phone: sanitizeStr(lead.phone, 40),
      email: sanitizeStr(lead.email || '', 160),
      origin: sanitizeStr(lead.source || 'site', 80),
      budgetRange: 'A confirmar',
      preferredCategories: [],
      interestedPropertyIds: lead.propertyId ? [lead.propertyId] : [],
      tags: (lead.tags || []).slice(0, 15),
      notes: sanitizeStr(lead.message || '', 3000),
      leadId: lead.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await setDoc(doc(db, 'pipeline', dealId), {
      title: sanitizeStr(lead.propertyTitle ? `${lead.name} — ${lead.propertyTitle}` : `Atendimento ${lead.name}`, 180),
      clientId,
      clientName: sanitizeStr(lead.name, 140),
      clientPhone: sanitizeStr(lead.phone, 40),
      leadId: lead.id,
      propertyId: sanitizeStr(lead.propertyId || '', 128),
      propertyTitle: sanitizeStr(lead.propertyTitle || '', 180),
      stage: lead.status || 'novo_lead',
      score: lead.score || 'morno',
      estimatedValue: null,
      source: sanitizeStr(lead.source || 'site', 80),
      tags: (lead.tags || []).slice(0, 10),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await updateDoc(doc(db, 'leads', lead.id), {
      status: lead.status === 'novo_lead' ? 'contato' : lead.status,
      updatedAt: serverTimestamp(),
    });

    return { clientId, dealId };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `clients/${clientId}`);
  }
}

export async function saveClient(client: Partial<Client> & { id?: string }): Promise<string> {
  const id = client.id || generateFirestoreId('cli');
  const isNew = !client.id;
  const payload = {
    name: sanitizeStr(client.name || 'Cliente', 140),
    phone: sanitizeStr(client.phone || '', 40),
    email: sanitizeStr(client.email || '', 160),
    origin: sanitizeStr(client.origin || 'Direto', 80),
    budgetRange: sanitizeStr(client.budgetRange || 'A confirmar', 100),
    preferredCategories: (client.preferredCategories || []).slice(0, 10),
    interestedPropertyIds: (client.interestedPropertyIds || []).slice(0, 20),
    tags: (client.tags || []).slice(0, 15),
    notes: sanitizeStr(client.notes || '', 3000),
    leadId: sanitizeStr(client.leadId || '', 128),
    updatedAt: serverTimestamp(),
  };

  try {
    if (isNew) {
      await setDoc(doc(db, 'clients', id), { ...payload, createdAt: serverTimestamp() });
    } else {
      await updateDoc(doc(db, 'clients', id), payload);
    }
    return id;
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, `clients/${id}`);
  }
}

export async function fetchClientInteractions(clientId: string): Promise<ClientInteraction[]> {
  try {
    const snap = await getDocs(query(collection(db, 'clients', clientId, 'interactions'), orderBy('createdAt', 'desc')));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ClientInteraction, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `clients/${clientId}/interactions`);
  }
}

export async function addClientInteraction(
  clientId: string,
  interaction: { type: ClientInteraction['type']; summary: string; authorEmail?: string }
): Promise<string> {
  const id = generateFirestoreId('int');
  try {
    await setDoc(doc(db, 'clients', clientId, 'interactions', id), {
      type: interaction.type,
      summary: sanitizeStr(interaction.summary, 1500),
      authorEmail: sanitizeStr(interaction.authorEmail || '', 160),
      createdAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `clients/${clientId}/interactions/${id}`);
  }
}

export async function savePipelineDeal(deal: Partial<PipelineDeal> & { id?: string }): Promise<string> {
  const id = deal.id || generateFirestoreId('deal');
  const isNew = !deal.id;
  const payload = {
    title: sanitizeStr(deal.title || 'Oportunidade', 180),
    clientId: sanitizeStr(deal.clientId || '', 128),
    clientName: sanitizeStr(deal.clientName || 'Cliente', 140),
    clientPhone: sanitizeStr(deal.clientPhone || '', 40),
    leadId: sanitizeStr(deal.leadId || '', 128),
    propertyId: sanitizeStr(deal.propertyId || '', 128),
    propertyTitle: sanitizeStr(deal.propertyTitle || '', 180),
    stage: deal.stage || 'novo_lead',
    score: deal.score || 'morno',
    estimatedValue: deal.estimatedValue !== undefined && deal.estimatedValue !== null ? Number(deal.estimatedValue) : null,
    source: sanitizeStr(deal.source || 'CRM', 80),
    tags: (deal.tags || []).slice(0, 10),
    updatedAt: serverTimestamp(),
  };

  try {
    if (isNew) {
      await setDoc(doc(db, 'pipeline', id), { ...payload, createdAt: serverTimestamp() });
    } else {
      await updateDoc(doc(db, 'pipeline', id), payload);
    }
    return id;
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, `pipeline/${id}`);
  }
}

export async function deletePipelineDeal(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'pipeline', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `pipeline/${id}`);
  }
}

export async function saveVisitAdmin(visit: Partial<Visit> & { id?: string }): Promise<string> {
  const id = visit.id || generateFirestoreId('visit');
  const isNew = !visit.id;
  const payload = {
    clientName: sanitizeStr(visit.clientName || 'Cliente', 140),
    clientPhone: sanitizeStr(visit.clientPhone || '', 40),
    clientEmail: sanitizeStr(visit.clientEmail || '', 160),
    propertyId: sanitizeStr(visit.propertyId || '', 128),
    propertyTitle: sanitizeStr(visit.propertyTitle || '', 180),
    empreendimentoId: sanitizeStr(visit.empreendimentoId || '', 128),
    scheduledDate: sanitizeStr(visit.scheduledDate || '', 30),
    scheduledTime: sanitizeStr(visit.scheduledTime || '', 20),
    notes: sanitizeStr(visit.notes || '', 1000),
    reminderSent: Boolean(visit.reminderSent),
    status: visit.status || 'confirmada',
    updatedAt: serverTimestamp(),
  };

  try {
    if (isNew) {
      await setDoc(doc(db, 'visits', id), { ...payload, createdAt: serverTimestamp() });
    } else {
      await updateDoc(doc(db, 'visits', id), payload);
    }
    return id;
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, `visits/${id}`);
  }
}

export async function saveProposal(proposal: Partial<Proposal> & { id?: string }): Promise<string> {
  const id = proposal.id || generateFirestoreId('prop');
  const isNew = !proposal.id;
  const payload = {
    clientId: sanitizeStr(proposal.clientId || '', 128),
    clientName: sanitizeStr(proposal.clientName || 'Cliente', 140),
    propertyId: sanitizeStr(proposal.propertyId || '', 128),
    propertyTitle: sanitizeStr(proposal.propertyTitle || 'Imóvel', 180),
    proposedValue: Number(proposal.proposedValue || 0),
    paymentTerms: sanitizeStr(proposal.paymentTerms || '', 1500),
    documentUrl: sanitizeStr(proposal.documentUrl || '', 1000),
    documentName: sanitizeStr(proposal.documentName || '', 180),
    status: proposal.status || 'rascunho',
    notes: sanitizeStr(proposal.notes || '', 2000),
    updatedAt: serverTimestamp(),
  };

  try {
    if (isNew) {
      await setDoc(doc(db, 'proposals', id), { ...payload, createdAt: serverTimestamp() });
    } else {
      await updateDoc(doc(db, 'proposals', id), payload);
    }
    return id;
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, `proposals/${id}`);
  }
}

export async function saveTask(task: Partial<Task> & { id?: string }): Promise<string> {
  const id = task.id || generateFirestoreId('task');
  const isNew = !task.id;
  const payload = {
    title: sanitizeStr(task.title || 'Follow-up', 180),
    description: sanitizeStr(task.description || '', 1000),
    dueDate: sanitizeStr(task.dueDate || '', 40),
    priority: task.priority || 'media',
    completed: Boolean(task.completed),
    clientId: sanitizeStr(task.clientId || '', 128),
    leadId: sanitizeStr(task.leadId || '', 128),
    updatedAt: serverTimestamp(),
  };

  try {
    if (isNew) {
      await setDoc(doc(db, 'tasks', id), { ...payload, createdAt: serverTimestamp() });
    } else {
      await updateDoc(doc(db, 'tasks', id), payload);
    }
    return id;
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, `tasks/${id}`);
  }
}

export async function deleteTask(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'tasks', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `tasks/${id}`);
  }
}

export async function saveMediaAsset(asset: Omit<MediaAsset, 'id' | 'createdAt'>): Promise<string> {
  const id = generateFirestoreId('media');
  try {
    await setDoc(doc(db, 'media', id), {
      name: sanitizeStr(asset.name, 200),
      url: sanitizeStr(asset.url, 1000),
      contentType: sanitizeStr(asset.contentType || 'image/jpeg', 100),
      sizeBytes: Number(asset.sizeBytes || 0),
      provider: asset.provider,
      createdAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `media/${id}`);
  }
}

export async function deleteMediaAsset(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'media', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `media/${id}`);
  }
}

export async function saveAdminUser(uid: string, data: { email: string; displayName?: string }): Promise<void> {
  const safeUid = sanitizeStr(uid, 128).replace(/[^a-zA-Z0-9_-]/g, '');
  try {
    await setDoc(doc(db, 'adminUsers', safeUid), {
      email: sanitizeStr(data.email, 160),
      displayName: sanitizeStr(data.displayName || 'Administrador', 140),
      role: 'admin',
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `adminUsers/${safeUid}`);
  }
}
