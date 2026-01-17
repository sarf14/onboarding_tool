#!/bin/bash

# Start Backend and Frontend Servers

echo "🚀 Starting Onboarding Platform Servers..."
echo ""

# Check if .env exists in backend
if [ ! -f backend/.env ]; then
    echo "⚠️  Backend .env file not found!"
    echo "📝 Creating .env file from template..."
    
    # Generate JWT secret
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
    
    cat > backend/.env << EOF
# Database Connection
# ⚠️  YOU NEED TO ADD YOUR DATABASE_URL HERE
# Get it from Supabase: https://supabase.com
# Or use local: postgresql://postgres:password@localhost:5432/onboarding_db
DATABASE_URL="postgresql://postgres:password@localhost:5432/onboarding_db"

# Direct URL (same as DATABASE_URL for local)
DIRECT_URL="postgresql://postgres:password@localhost:5432/onboarding_db"

# JWT Secret (auto-generated)
JWT_SECRET="${JWT_SECRET}"

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
EOF
    
    echo "✅ Created backend/.env"
    echo "⚠️  Please edit backend/.env and add your DATABASE_URL!"
    echo ""
fi

# Start backend in background
echo "🔧 Starting Backend Server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend in background
echo "🎨 Starting Frontend Server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Servers starting..."
echo ""
echo "📊 Backend: http://localhost:5000"
echo "🌐 Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for user interrupt
wait
