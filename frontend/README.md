# 3PDMS Frontend

This is the frontend for the 3rd Party Delivery Management System (3PDMS).

- React 19 + TypeScript
- Vite build system
- Split layouts for Public, Client and Admin

Development

```bash
cd frontend
npm install
npm run dev
```

Build

```bash
npm run build
npm run preview
```

The project uses theme CSS variables in `src/styles/app.css` and lazy-loads large admin pages to keep the initial bundle small.
