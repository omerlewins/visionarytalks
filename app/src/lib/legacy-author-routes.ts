export function legacyAuthorDestination(path: string) {
  const match = path.match(/^\/author\/(?:max|omer|claude-editor)\/(?:page\/([1-9]\d*)\/)?$/i);
  if (!match) return undefined;
  return "/author/daniel-mercer/" + (match[1] ? `page/${match[1]}/` : "");
}
