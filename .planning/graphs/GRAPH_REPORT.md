# Graph Report - properties-for-rent  (2026-07-30)

## Corpus Check
- 144 files · ~116,294 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 767 nodes · 1236 edges · 107 communities (55 shown, 52 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 34 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `33b613ea`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.js
- dependencies
- dependencies
- Apna Stay — Implementation Plan
- index.js
- expo
- success
- fail
- Apna Stay — Backend Implementation
- useAuth
- AddPropertyScreen.js
- PropertyDetailScreen.js
- migrate_to_new_account.js
- db.js
- AuthContext.js
- property.controller.js
- DashboardScreen.js
- package.json
- user.controller.js
- property.routes.js
- review.controller.js
- SupportInfoCard.js
- auth.controller.js
- HomeScreen.js
- MainTabs.js
- PropertyCardSkeleton.js
- dependencies
- api.js
- 🏡 Apna Stay - Absolute Beginner's Guide
- page.js
- MapPicker.js
- HomePageClient.js
- GeoContext.js
- MapErrorBoundary
- page.js
- page.js
- PropertyDetailClient.js
- AuthContext.js
- fix-db.js
- migrate.js
- migrate_booking_type.js
- migrate_reviews.js
- setup_support_db.js
- test_api.js
- test_query.js
- update-categories.js
- compilerOptions
- page.js
- layout.js
- page.js
- page.js
- CategoryFilter.js
- expo
- @expo-google-fonts/cormorant-garamond
- @expo-google-fonts/dm-sans
- @expo-google-fonts/inter
- expo-image-picker
- expo-location
- expo-secure-store
- expo-splash-screen
- expo-status-bar
- expo-web-browser
- AGENTS.md
- eslint.config.mjs
- next.config.mjs
- postcss.config.mjs
- brand.config.js
- @gorhom/bottom-sheet
- axios
- react
- @react-native-community/netinfo
- react-native-gesture-handler
- react-native-map-clustering
- react-native-maps
- react-native-reanimated
- react-native-safe-area-context
- react-native-screens
- react-native-svg
- react-native-webview
- react-native-worklets
- @react-navigation/bottom-tabs
- @react-navigation/native
- @react-navigation/native-stack
- brand.js

## God Nodes (most connected - your core abstractions)
1. `colors` - 30 edges
2. `success()` - 26 edges
3. `fonts` - 26 edges
4. `fail()` - 24 edges
5. `spacing` - 24 edges
6. `fontSizes` - 23 edges
7. `borderRadius` - 21 edges
8. `useAuth()` - 19 edges
9. `Apna Stay — Implementation Plan` - 13 edges
10. `isValidUUID()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `cleanup()` --calls--> `deleteImage()`  [EXTRACTED]
  backend/scripts/cleanupTestData.js → backend/src/utils/cloudinary.js
- `getAllProperties()` --calls--> `success()`  [EXTRACTED]
  backend/src/controllers/admin.controller.js → backend/src/utils/response.js
- `approveProperty()` --calls--> `fail()`  [EXTRACTED]
  backend/src/controllers/admin.controller.js → backend/src/utils/response.js
- `approveProperty()` --calls--> `isValidUUID()`  [EXTRACTED]
  backend/src/controllers/admin.controller.js → backend/src/utils/uuid.js
- `deleteProperty()` --calls--> `deleteImage()`  [EXTRACTED]
  backend/src/controllers/admin.controller.js → backend/src/utils/cloudinary.js

## Import Cycles
- None detected.

## Communities (107 total, 52 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.05
Nodes (34): adminRoutes, app, authRoutes, compression, cors, { CORS_ORIGIN, NODE_ENV }, errorHandler, express (+26 more)

### Community 1 - "dependencies"
Cohesion: 0.05
Nodes (38): eslint, eslint-config-next, dependencies, axios, leaflet, leaflet-defaulticon-compatibility, lodash.debounce, next (+30 more)

### Community 2 - "dependencies"
Cohesion: 0.05
Nodes (37): dependencies, bcryptjs, cloudinary, compression, cors, dotenv, express, express-rate-limit (+29 more)

### Community 3 - "Apna Stay — Implementation Plan"
Cohesion: 0.06
Nodes (33): 10. Security Checklist, 11. Future Upgrade Path (Phase 2), 1. System Architecture Overview, 2. Folder Structure, 3. Database Schema (PostgreSQL + PostGIS), 4. API Design, 5. Authentication Flow, 6. Image Upload Flow (+25 more)

### Community 4 - "index.js"
Cohesion: 0.15
Nodes (19): SimpleBarChart(), styles, styles, styles, styles, styles, styles, SearchBar() (+11 more)

### Community 5 - "expo"
Cohesion: 0.06
Nodes (31): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, config, package, permissions (+23 more)

### Community 6 - "success"
Cohesion: 0.14
Nodes (21): approveProperty(), { deleteImage }, deleteProperty(), getAdminStats(), getOwnerDetails(), { invalidatePropertyCaches }, { isValidUUID }, pool (+13 more)

### Community 7 - "fail"
Cohesion: 0.15
Nodes (16): getSupportInfo(), pool, { success, fail }, updateSupportInfo(), authorize(), { fail }, jwt, { JWT_SECRET } (+8 more)

### Community 8 - "Apna Stay — Backend Implementation"
Cohesion: 0.10
Nodes (19): 1. Folder Structure, 2. Database Schema (SQL), 3. Express Server Setup, 4. Auth Routes + Controllers, 5. Property Routes + Controllers, 6. Geo Query Implementation (SQL + Logic), 7. Middleware (Auth + Error Handling), Apna Stay — Backend Implementation (+11 more)

### Community 9 - "useAuth"
Cohesion: 0.16
Nodes (14): styles, Toast(), useAuth(), AccountStack(), Stack, AuthStack(), Stack, AccountScreen() (+6 more)

### Community 10 - "AddPropertyScreen.js"
Cohesion: 0.15
Nodes (14): CategoryFilter(), styles, ImagePicker(), MapPicker(), BOOKING_TYPES, CATEGORIES, DEFAULT_ZOOM_DELTA, RADIUS_OPTIONS (+6 more)

### Community 11 - "PropertyDetailScreen.js"
Cohesion: 0.29
Nodes (12): getSafeCoordinate(), MapViewInner(), styles, { width }, PropertyCard(), styles, getOptimizedImageUrl(), getLat() (+4 more)

### Community 12 - "migrate_to_new_account.js"
Cohesion: 0.19
Nodes (16): createSchema(), downloadImage(), fs, http, https, log(), main(), migrateCloudinaryImages() (+8 more)

### Community 13 - "db.js"
Cohesion: 0.13
Nodes (6): pool, pool, pool, pool, originalQuery, { Pool }

### Community 14 - "AuthContext.js"
Cohesion: 0.20
Nodes (9): ReviewsSection(), styles, api, clearAuthState, loadToken(), navigationRef, setToken(), AuthContext (+1 more)

### Community 15 - "property.controller.js"
Cohesion: 0.21
Nodes (12): getAllProperties(), { deleteImage }, getNearbyProperties(), getProperties(), { invalidatePropertyCaches }, { isValidUUID }, pool, { success, fail } (+4 more)

### Community 16 - "DashboardScreen.js"
Cohesion: 0.21
Nodes (9): App(), EmptyState(), LoadingScreen(), styles, NetworkBanner(), RootNavigator(), Stack, DashboardScreen() (+1 more)

### Community 17 - "package.json"
Cohesion: 0.15
Nodes (12): babel-preset-expo, devDependencies, babel-preset-expo, main, name, private, scripts, android (+4 more)

### Community 18 - "user.controller.js"
Cohesion: 0.21
Nodes (10): cleanup(), { deleteImage }, pool, { deleteImage }, { invalidatePropertyCaches }, pool, { success, fail }, deleteImage() (+2 more)

### Community 19 - "property.routes.js"
Cohesion: 0.19
Nodes (10): getPropertyById(), buildNearbyCacheKey(), cacheResponse(), NodeCache, normalizeNumber(), propertyCache, { cacheResponse, buildNearbyCacheKey }, {
  createProperty,
  getProperties,
  getNearbyProperties,
  getPropertyById,
  deleteProperty,
} (+2 more)

### Community 20 - "review.controller.js"
Cohesion: 0.23
Nodes (10): createReview(), deleteReview(), getPropertyReviews(), { isValidUUID }, pool, { success, fail }, {
  createReview,
  getPropertyReviews,
}, { protect } (+2 more)

### Community 21 - "SupportInfoCard.js"
Cohesion: 0.39
Nodes (10): styles, SupportInfoCard(), getGoogleMapsUrl(), getWhatsAppUrl(), openDirections(), openEmail(), openInstagram(), openPhone() (+2 more)

### Community 22 - "auth.controller.js"
Cohesion: 0.22
Nodes (10): bcrypt, jwt, { JWT_SECRET, JWT_EXPIRES_IN }, login(), pool, register(), { success, fail }, { validateRegister, validateLogin } (+2 more)

### Community 23 - "HomeScreen.js"
Cohesion: 0.24
Nodes (9): RadiusFilter(), DEFAULT_LOCATION, GeoContext, GeoProvider(), useGeo(), calculateDistance(), DEFAULT_CENTER, HomeScreen() (+1 more)

### Community 24 - "MainTabs.js"
Cohesion: 0.22
Nodes (8): AdminStack(), Stack, DashboardStack(), ExploreStack(), Stack, MainTabs(), Tab, AdminScreen()

### Community 26 - "dependencies"
Cohesion: 0.22
Nodes (9): expo-font, dependencies, expo-font, react-native, @react-native-async-storage/async-storage, react-native-keyboard-aware-scroll-view, react-native, @react-native-async-storage/async-storage (+1 more)

### Community 29 - "🏡 Apna Stay - Absolute Beginner's Guide"
Cohesion: 0.25
Nodes (7): 🗺️ A Note on Leaflet (The Maps), 🏡 Apna Stay - Absolute Beginner's Guide, 🛠️ Step 1: Install Required Software, 🗄️ Step 2: Set Up the Database (Neon DB), ⚙️ Step 3: Set up the Backend (Server), 🎨 Step 4: Set up the Frontend (Website UI), 🚀 Step 5: How to Deploy (Put it on the Internet)

### Community 31 - "MapPicker.js"
Cohesion: 0.33
Nodes (3): dmsToDecimal(), KARNATAKA_BOUNDS, parseCoordinates()

### Community 32 - "HomePageClient.js"
Cohesion: 0.40
Nodes (5): calculateDistance(), DEFAULT_CENTER, HomePageClient(), LOADING_MESSAGES, LOCATION_MESSAGES

### Community 33 - "GeoContext.js"
Cohesion: 0.33
Nodes (3): DEFAULT_LOCATION, GEO_OPTIONS, GeoContext

### Community 38 - "page.js"
Cohesion: 0.67
Nodes (3): FAQ_ITEMS, getInitialProperties(), HomePage()

### Community 39 - "page.js"
Cohesion: 0.83
Nodes (3): fetchProperty(), generateMetadata(), PropertyDetailPage()

## Knowledge Gaps
- **313 isolated node(s):** `pool`, `pool`, `{ Client }`, `{ Client }`, `{ Pool }` (+308 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **52 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `package.json`, `expo`, `@expo-google-fonts/cormorant-garamond`, `@expo-google-fonts/dm-sans`, `@expo-google-fonts/inter`, `expo-image-picker`, `expo-location`, `expo-secure-store`, `expo-splash-screen`, `expo-status-bar`, `expo-web-browser`, `@gorhom/bottom-sheet`, `axios`, `react`, `@react-native-community/netinfo`, `react-native-gesture-handler`, `react-native-map-clustering`, `react-native-maps`, `react-native-reanimated`, `react-native-safe-area-context`, `react-native-screens`, `react-native-svg`, `react-native-webview`, `react-native-worklets`, `@react-navigation/bottom-tabs`, `@react-navigation/native`, `@react-navigation/native-stack`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Why does `ImagePicker()` connect `AddPropertyScreen.js` to `expo-image-picker`, `index.js`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Why does `expo-image-picker` connect `expo-image-picker` to `dependencies`, `AddPropertyScreen.js`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **What connects `pool`, `pool`, `{ Client }` to the rest of the system?**
  _313 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.049494949494949494 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05263157894736842 - nodes in this community are weakly interconnected._