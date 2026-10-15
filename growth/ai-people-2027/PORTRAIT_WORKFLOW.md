# Watchlist portrait workflow

Use one distinct illustration for each of the 100 stable person IDs. The shortlist still contains twelve entries; portrait coverage is separate from shortlist selection.

Use the built-in imagegen tool and the existing graphite portrait as the style reference. Locate an attributable public face reference for the named person, inspect it, and distinguish that identity reference from the style reference. Annotate the correct subject when a reference contains more than one person. Never substitute an unrelated avatar or invent a likeness from an unknown biography.

Generate each portrait separately. Preserve facial geometry, hair and any existing glasses; remove scenery and props. Use centered head-and-shoulders framing, black and gray graphite/ink stippling, warm ivory and a muted sage halo. Keep the face readable at 132px. Do not add names, logos or invented accessories inside the image.

Save final web assets under `app/public/reference/watchlist/`, with square 320px WebP exports and stable versioned filenames. Preserve existing accepted files. Keep source photographs private; `portrait-manifest.json` and `portrait-jobs/` record source pages and generation prompts. Historical photographs establish a face reference, not a current job or an interview.

Register each number and public asset path in `app/src/data/watchlist-portraits.json`. The shared `AIWatchlist` renderer handles entry placement, illustration captions and disclosure. The expanded index uses decorative miniature portraits with empty alt text because the adjacent name already supplies the link label. Keep lazy loading and fixed image dimensions.

Run watchlist validation, tests, build and `check-profile-preview.cjs`, including desktop, mobile and no-JavaScript checks. Verify exactly 100 entry portraits, valid assets and stable anchors. A complete image set does not approve the expanded article's factual claims or authorize its publication.
