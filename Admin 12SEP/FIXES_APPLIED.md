# Job Portal Admin - NOVA AI Fixes

Applied fixes:
- Restored `src/components/admin/NovaAiInterviews.jsx` as a React/Vite component. The accidental backend-only `multer`/`fs` code is removed from the frontend.
- Fixed the API import path to `../../utils/data`.
- Added `/admin/nova-ai-interviews` route and sidebar entry.
- Added proper loading, error, refresh and review-decision handling.
- NOVA API uses the existing `VITE_API_URL` value (`http://localhost:5000` in the supplied `.env`).

Run:
1. `npm install`
2. `npm run dev`

For production:
1. Set `VITE_API_URL` to the backend URL.
2. `npm install`
3. `npm run build`
4. Deploy the generated `dist` folder.
