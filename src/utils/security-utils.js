
export function isSecuritySchemeIdValid(security, securitySchemeId) {
    if (!security) return true;
    return security.some((securityObject) => {
      return (
        securityObject.hasOwnProperty(securitySchemeId) &&
        Array.isArray(securityObject[securitySchemeId]) &&
        securityObject[securitySchemeId].length === 0
      );
    });
  }
  