# AgriData Intelligence - Agricultural & Climate Data Query Platform

A full-stack web application that allows users to ask natural language questions about Indian agricultural and climate data from data.gov.in and receive accurate, source-cited answers.

## Features

- 🤖 **Natural Language Queries**: Ask questions in plain English about agricultural and climate data
- 📊 **Data Visualizations**: Interactive charts and tables for data analysis
- 📚 **Source Citations**: Every answer includes citations to the exact datasets used
- 📈 **Comprehensive Data**: Pre-loaded datasets covering crop production and rainfall data (2018-2022)
- 🎯 **Multi-State Support**: Data from Maharashtra, Punjab, Uttar Pradesh, Bihar, West Bengal, Rajasthan, Haryana, and more
- 💬 **Chat Interface**: Modern, responsive chat interface for seamless interactions
- 🔍 **Dataset Browser**: View, search, and explore all datasets directly in the application

## Project Repository

**GitHub**: https://github.com/bhaveshpatil093/AgriData-Intelligence

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher) and npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- A Supabase account and project
- Google Gemini API key

### Step 1: Clone and Install

```sh
# Clone the repository
git clone https://github.com/bhaveshpatil093/AgriData-Intelligence.git
cd AgriData-Intelligence

# Install dependencies
npm install
```

### Step 2: Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# Note: GOOGLE_GEMINI_API_KEY must be set in Supabase project settings
# Go to: Supabase Dashboard > Project Settings > Edge Functions > Secrets
```

### Step 3: Set Up Supabase

1. **Create a Supabase project** at https://supabase.com
2. **Run the migration**: The database schema is in `supabase/migrations/`. Apply it via Supabase Dashboard or CLI:
   ```sh
   supabase db reset
   ```
3. **Set Edge Function Secrets**: 
   - Go to Project Settings > Edge Functions > Secrets
   - Add `GOOGLE_GEMINI_API_KEY` with your API key: `AIzaSyD4Z0P2FYL9QgJoyFmuYumkYtMIpVH7foc`

### Step 4: Deploy Edge Functions

```sh
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy query-data
supabase functions deploy seed-datasets
```

### Step 5: Run the Application

```sh
# Start the development server
npm run dev
```

The application will be available at `http://localhost:8080`

### Step 6: Initialize Sample Data

On first load, the application will automatically seed sample datasets. You can also manually trigger it by calling the `seed-datasets` function.

## Example Questions

Try these sample questions to test the platform:

1. "Compare the average annual rainfall in Maharashtra and Punjab for the last 5 years. List the top 3 most produced crops in each state."
2. "Which district in Uttar Pradesh had the highest wheat production in 2022? Compare it with the district with lowest wheat production in Bihar."
3. "Analyze the rice production trend in Eastern India over the last decade."
4. "What are 3 data-backed arguments for promoting drought-resistant crops in Rajasthan?"

## Development

### Running Locally

```sh
npm run dev
```

The application will start at `http://localhost:8080`

### Building for Production

```sh
npm run build
```

The built files will be in the `dist` directory.

### Project Structure

```
agri-query-guru/
├── src/
│   ├── components/       # React components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom React hooks
│   ├── integrations/     # Supabase integration
│   └── lib/              # Utility functions
├── supabase/
│   ├── functions/        # Edge Functions (Deno)
│   └── migrations/       # Database migrations
└── public/               # Static assets
```

## What technologies are used for this project?

### Frontend
- **Vite** - Build tool and dev server
- **React** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn-ui** - UI component library
- **Recharts** - Data visualization
- **React Router** - Routing
- **TanStack Query** - Data fetching

### Backend
- **Supabase** - Database and Edge Functions
- **Deno** - Runtime for Edge Functions
- **Google Gemini API** - LLM for natural language processing

### Database
- **PostgreSQL** (via Supabase) - Data storage
- **JSONB** - Flexible data storage for datasets

## Deployment

### Deploy Frontend

You can deploy the frontend to any static hosting service:

- **Vercel**: Connect your GitHub repo and deploy automatically
- **Netlify**: Connect your GitHub repo or deploy via CLI
- **GitHub Pages**: Use GitHub Actions to build and deploy

### Deploy Supabase Functions

Make sure your Supabase project is set up and deploy the Edge Functions:

```sh
supabase functions deploy query-data
supabase functions deploy seed-datasets
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.
