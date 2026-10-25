# Private hotel reservation demonstration

Routes: `/demo-hotel`, `/demo-hotel/chambre-double-01` through `04`, `/demo-hotel/la-suite`. Uses the existing restaurant demo session/password. Public hotel page and booking widget are unchanged.

Room descriptions, photos, configured nightly prices, cleaning, breakfast, capacity and standard cancellation terms were read from the signed-in Holidu account on 2026-10-25. Room numbers distinguish Holidu's generic names; they do not claim historic marketing names. Rates are a dated snapshot, not an iCal feature. No quote is generated outside recorded rate periods. Tourist tax is excluded and explicitly noted.

Five private export links are entered through `/demo-hotel-config.php`; they are stored above the document root with restrictive permissions. Calendar URLs and guest details are never exposed by the calendar API or committed. HTTPS requests allow only the observed Holidu calendar host, disallow redirects, limit response size and time. Successful calendar reads cache for five minutes; failed reads disable quotes. Submission always forces a new read. Unsupported recurrence fails closed. DTEND is exclusive. iCal data only marks occupied dates; it cannot confirm reservations or prevent cross-channel races.

Bookings are session-only simulations. They do not send mail, collect payments, export blocks, or modify Holidu. A real booking engine would require a shared transactional booking store, outbound inventory synchronization and operational confirmation, rather than treating delayed iCal as a channel-manager API.

Validation: `php tools/hotel-demo-test.php`, PHP lint for all five PHP files, `node --check assets/js/demo-hotel.js`, rendered-page checks for native forms and absence of Holidu iframe. Live configuration and browser checks required after deployment.
