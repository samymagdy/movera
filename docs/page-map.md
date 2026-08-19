# Page map

Public locale routes:

- `/en`, `/ar`, `/fr`, `/nl`: fixed homepage composition
- `/{locale}/about`: locale-aware About content listing
- `/{locale}/about/{slug}`: history, vision/mission, clients/certificates, CEO, leadership, and legal detail
- `/{locale}/services`: locale-aware services listing
- `/{locale}/services/{slug}`: service detail
- `/{locale}/products`: products listing
- `/{locale}/products/{slug}`: product detail
- `/{locale}/projects`: projects listing with filter chips
- `/{locale}/projects/{slug}`: project detail
- `/{locale}/news`, `/{locale}/news/{slug}`: news listing and detail
- `/{locale}/blogs`, `/{locale}/blogs/{slug}`: blog listing and detail
- `/{locale}/innovation-hub`, `/{locale}/innovation-hub/{slug}`: innovation content
- `/{locale}/careers`, `/{locale}/careers/{slug}`: careers listing, detail, and local application form
- `/{locale}/regions/{hub-a|hub-b|hub-c}`: independently authored regional operations
- `/{locale}/search`: grouped global search
- `/{locale}/privacy-policy`, `/{locale}/terms-and-conditions`, `/{locale}/cookie-policy`: legal content
- `/{locale}/contact`: homepage composition focused to Contact

The homepage composition remains fixed and source-owned. New content routes use the same public primitives and consume the aggregate CMS document. The CMS is a separate root app with structured sections for Homepage, News, Blogs, Projects, Services, Products, Pages & legal, Careers, Innovation Hub, and Media library.
