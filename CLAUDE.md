# Claude Code Context for nomina-app

This project is a full-stack application for processing and validating payroll (nómina) documents.

## Commands

- **Build**: `npm run build`
- **Frontend (Dev)**: `npm start`
- **Backend (Dev)**: `node backend/server.js`
- **Tests**: `npm test`
- **Lint**: `npm run lint` (if available)

## Architecture

- **Frontend**: React application in `src/`. Uses `axios` for API calls and `framer-motion` for animations.
- **Backend**: Node.js/Express server in `backend/`. 
- **Core Logic**:
  - `backend/services/nominaValidator.js`: Main logic for payroll validation.
  - `backend/strategies/`: Pattern-based strategies for different payroll formats (Leroy Merlin, Mercadona, etc.).
  - `backend/data/`: JSON files containing convention rules.

## Code Style

- Use functional React components.
- Preference for clear, documented strategy patterns in the backend.
- Maintain Spanish labels for domain-specific payroll concepts.
