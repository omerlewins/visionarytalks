import { test } from "node:test";
import assert from "node:assert/strict";
import { legacyAuthorDestination } from "../src/lib/legacy-author-routes";
import { matchesArchive } from "../src/lib/editorial-taxonomy";
test("old author archive redirects preserve pagination without matching unrelated routes", () => {
  assert.equal(legacyAuthorDestination('/author/claude-editor/page/2/'),'/author/daniel-mercer/page/2/');
  assert.equal(
    legacyAuthorDestination("/author/max/"),
    "/author/daniel-mercer/",
  );
  assert.equal(
    legacyAuthorDestination("/author/max/page/8/"),
    "/author/daniel-mercer/page/8/",
  );
  assert.equal(
    legacyAuthorDestination("/author/omer/page/2/"),
    "/author/daniel-mercer/page/2/",
  );
  assert.equal(
    legacyAuthorDestination("/author/daniel-mercer/page/2/"),
    undefined,
  );
  assert.equal(legacyAuthorDestination("/author/omer/page/0/"), undefined);
  assert.equal(legacyAuthorDestination("/author/another-reporter/"), undefined);
});
test("Daniel archive finds publication articles even when the CMS author path uses the about page", () => {
  for (const name of ["Max Talks", "omer", "claude-editor"]) assert.equal(matchesArchive({kind:"article",path:"/example/",title:"Example",author:{name,path:"/author/legacy/"}} as any,"author","daniel-mercer"),true);
  assert.equal(
    matchesArchive(
      {
        kind: "article",
        path: "/example/",
        title: "Example",
        author: { name: "Daniel Mercer", path: "/about/#about-me" },
      } as any,
      "author",
      "daniel-mercer",
    ),
    true,
  );
  assert.equal(
    matchesArchive(
      {
        kind: "article",
        path: "/example/",
        title: "Example",
        author: { name: "Another author", path: "/author/another/" },
      } as any,
      "author",
      "daniel-mercer",
    ),
    false,
  );
});
