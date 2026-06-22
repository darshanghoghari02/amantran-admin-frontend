import { NextRequest, NextResponse } from 'next/server';

// The real backend URL — only used server-side, never exposed to browser
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Catch-all proxy: forwards every /api/proxy/... request to the backend
// Since this runs on the Next.js server, there is NO browser CORS — requests
// go server → backend directly, bypassing all browser cross-origin restrictions.
async function proxyRequest(req: NextRequest, params: { path?: string[] }) {
  const pathSegments = params?.path || [];
  const backendPath = pathSegments.join('/');

  // Preserve query string
  const searchParams = req.nextUrl.searchParams.toString();
  const cleanBackendUrl = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
  const backendUrl = `${cleanBackendUrl}/${backendPath}${searchParams ? `?${searchParams}` : ''}`;

  // Forward headers the backend needs, stripping host so it doesn't conflict
  const forwardHeaders: Record<string, string> = {
    'Content-Type': req.headers.get('content-type') || 'application/json',
  };

  const authorization = req.headers.get('authorization');
  if (authorization) forwardHeaders['Authorization'] = authorization;

  const xUserId = req.headers.get('x-user-id');
  if (xUserId) forwardHeaders['x-user-id'] = xUserId;

  const accept = req.headers.get('accept');
  if (accept) forwardHeaders['Accept'] = accept;

  try {
    // Read the body for POST/PUT/PATCH requests
    let body: BodyInit | null = null;
    if (!['GET', 'HEAD', 'DELETE'].includes(req.method)) {
      const contentType = req.headers.get('content-type') || '';
      if (contentType.includes('multipart/form-data')) {
        // For file uploads, pass the raw FormData through
        body = await req.formData() as unknown as BodyInit;
        // Remove Content-Type so fetch sets it automatically with boundary
        delete forwardHeaders['Content-Type'];
      } else {
        body = await req.text();
      }
    }

    const backendRes = await fetch(backendUrl, {
      method: req.method,
      headers: forwardHeaders,
      body: body,
      // Disable redirect following — let client handle redirects
      redirect: 'manual',
    });

    // Stream the response body back to the client
    const responseBody = await backendRes.arrayBuffer();
    const responseHeaders = new Headers();

    // Forward relevant response headers
    const contentType = backendRes.headers.get('content-type');
    if (contentType) responseHeaders.set('Content-Type', contentType);

    const contentLength = backendRes.headers.get('content-length');
    if (contentLength) responseHeaders.set('Content-Length', contentLength);

    // CORS headers (for same-site, these aren't strictly needed but don't hurt)
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id');

    return new NextResponse(responseBody, {
      status: backendRes.status,
      statusText: backendRes.statusText,
      headers: responseHeaders,
    });
  } catch (error: unknown) {
    console.error(`[Proxy] Failed to reach backend at ${backendUrl}:`, error);
    return NextResponse.json(
      {
        error: 'Backend server is unreachable. Please check that the backend is running.',
        backendUrl,
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}

// Export all HTTP methods
export async function GET(req: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return proxyRequest(req, await context.params);
}
export async function POST(req: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return proxyRequest(req, await context.params);
}
export async function PUT(req: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return proxyRequest(req, await context.params);
}
export async function PATCH(req: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return proxyRequest(req, await context.params);
}
export async function DELETE(req: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return proxyRequest(req, await context.params);
}
export async function OPTIONS(req: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id',
      'Access-Control-Max-Age': '86400',
    },
  });
}
