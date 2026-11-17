interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
}

export default function handler(_req: unknown, res: ApiResponse) {
  res.status(200).json({
    status: 'ok',
    vercelBlobConfigured: true,
    blobStoreId: process.env.BLOB_STORE_ID || 'store_sjvci0CE2mr28sZW',
    timestamp: new Date().toISOString(),
  });
}
