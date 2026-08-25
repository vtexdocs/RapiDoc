/* eslint-disable import/prefer-default-export */
export function isSecuritySchemeIdValid(security, securitySchemeId) {
  if (!security) return true;
  return security.some((securityObject) => (
    Object.prototype.hasOwnProperty.call(securityObject, securitySchemeId)
        && Array.isArray(securityObject[securitySchemeId])
        && securityObject[securitySchemeId].length === 0
  ));
}
