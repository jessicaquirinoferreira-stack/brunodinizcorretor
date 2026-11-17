interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
}

export default function handler(_req: unknown, res: ApiResponse) {
  res.status(200).json({
    status: 'ok',
    vercelBlobConfigured: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    timestamp: new Date().toISOString(),
  });
}
