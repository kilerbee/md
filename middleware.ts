import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (hasExpectedAdminUsername(request.headers.get("authorization"))) {
    return NextResponse.next();
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Muzički Događaji Admin"'
    }
  });
}

export const config = {
  matcher: ["/admin/:path*"]
};

function hasExpectedAdminUsername(authorizationHeader: string | null) {
  const username = process.env.ADMIN_USERNAME;

  if (!username || !authorizationHeader?.startsWith("Basic ")) {
    return false;
  }

  const credentials = decodeBasicCredentials(authorizationHeader);

  return credentials?.username === username;
}

function decodeBasicCredentials(authorizationHeader: string) {
  try {
    const encoded = authorizationHeader.replace("Basic ", "");
    const decoded = atob(encoded);
    const separatorIndex = decoded.indexOf(":");

    if (separatorIndex === -1) {
      return null;
    }

    return {
      username: decoded.slice(0, separatorIndex)
    };
  } catch {
    return null;
  }
}
