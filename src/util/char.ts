export const capitalize = (word: string) => (word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : "")

/**
 * Filters out the scope `openid` as it is not recognized
 * by Linkedin and if it is passed it will throws an error
 * @param scopes a space separated list of scopes
 */
export const filterOutScopesForLinkedin = (scopes: string) => {
  if (!scopes) console.error(`filterOutScopesForLinkedin scopes is: ${scopes}`)
  return scopes
    .split(" ")
    .filter((scope) => scope !== "openid")
    .join(" ")
}
