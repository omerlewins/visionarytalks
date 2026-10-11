# Search Console and Google Analytics in the CMS

Open CMS → Settings → Search & Analytics (`/admin/globals/integrations`). Administrators can save connection settings; administrators and editors can check reports. The reporting endpoint requires a CMS login. Visitor pages receive only validated tracking and verification identifiers.

## Setup

1. Save the exact Search Console property, such as `sc-domain:visionarytalks.com` or the verified HTTPS URL-prefix property.
2. Optionally save the Google HTML verification token, without the surrounding tag. This applies to URL-prefix verification; a Domain property uses DNS verification.
3. Save GA4's numeric property ID for reports and the `G-` measurement ID for website tracking. These identifiers serve different purposes.
4. Enable the Search Console API and Google Analytics Data API in a Google Cloud project. Create a service account and grant its email access to the Search Console property and Viewer access to GA4.
5. Set `GOOGLE_SERVICE_ACCOUNT_JSON` in the appropriate Vercel environment with the service-account JSON credential. Do not store the private key in CMS fields or source control. Redeploy after changing this environment variable.
6. Save CMS settings, then click **Check access & load report**. The UI distinguishes a missing configuration, permission error, authentication failure and a successful request. No Google account is connected automatically.
7. When ready, enable live GA4 tracking. Tracking loads only in production after the visitor allows analytics. Visitors can decline or change their preference. Advertising storage, personalization and signals remain disabled. Disable automatic history-based page views in GA4 Enhanced Measurement if using this application's explicit SPA page-view events to avoid duplication.

Search Console reports a 28-day Pacific-time window ending three days ago and requests finalized web-search totals. GA4 reports the last 28 days through yesterday in the property's time zone. Empty report rows are shown as no data, not a failed connection. A successful reporting request does not prove the website tag is installed or collecting traffic.

No property IDs or Google credentials were supplied during implementation. Tracking remains disabled. The additive database migration creates only the integration-settings table.

Official references: [Search Analytics API](https://developers.google.com/webmaster-tools/v1/searchanalytics/query), [GA4 Data API](https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/properties/runReport), [Google service accounts](https://developers.google.com/identity/protocols/oauth2/service-account), [consent mode](https://developers.google.com/tag-platform/security/guides/consent).
