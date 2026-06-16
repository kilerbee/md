import bcrypt from "bcryptjs";

export function isAdminAuthorized(authorizationHeader: string | null) {
  const username = process.env.ADMIN_USERNAME;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH?.replaceAll("\\$", "$");

  if (!username || !passwordHash || !authorizationHeader?.startsWith("Basic ")) {
    return false;
  }

  const credentials = decodeBasicCredentials(authorizationHeader);

  if (!credentials || credentials.username !== username) {
    return false;
  }

  return bcrypt.compareSync(credentials.password, passwordHash);
}

export function hasExpectedAdminUsername(authorizationHeader: string | null) {
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
    const decoded = Buffer.from(encoded, "base64").toString("utf8");
    const separatorIndex = decoded.indexOf(":");

    if (separatorIndex === -1) {
      return null;
    }

    return {
      username: decoded.slice(0, separatorIndex),
      password: decoded.slice(separatorIndex + 1)
    };
  } catch {
    return null;
  }
}
