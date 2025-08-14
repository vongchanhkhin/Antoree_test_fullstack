#!/bin/bash

echo "🚀 Generating all education platform modules..."

# Posts module
echo "Creating posts module..."
npx nest generate module routes/posts --no-spec
npx nest generate service routes/posts --no-spec
npx nest generate controller routes/posts --no-spec

# Comments module
echo "Creating comments module..."
npx nest generate module routes/comments --no-spec
npx nest generate service routes/comments --no-spec
npx nest generate controller routes/comments --no-spec

# Votes module
echo "Creating votes module..."
npx nest generate module routes/votes --no-spec
npx nest generate service routes/votes --no-spec
npx nest generate controller routes/votes --no-spec

# Taxonomy module
echo "Creating taxonomy module..."
npx nest generate module routes/taxonomy --no-spec
npx nest generate service routes/taxonomy --no-spec
npx nest generate controller routes/taxonomy --no-spec

# Search module
echo "Creating search module..."
npx nest generate module routes/search --no-spec
npx nest generate service routes/search --no-spec
npx nest generate controller routes/search --no-spec

# Moderation module
echo "Creating moderation module..."
npx nest generate module routes/moderation --no-spec
npx nest generate service routes/moderation --no-spec
npx nest generate controller routes/moderation --no-spec

# Media module
echo "Creating media module..."
npx nest generate module routes/media --no-spec
npx nest generate service routes/media --no-spec
npx nest generate controller routes/media --no-spec

# AI module
echo "Creating ai module..."
npx nest generate module routes/ai --no-spec
npx nest generate service routes/ai --no-spec
npx nest generate controller routes/ai --no-spec

# Learning module
echo "Creating learning module..."
npx nest generate module routes/learning --no-spec
npx nest generate service routes/learning --no-spec
npx nest generate controller routes/learning --no-spec

# Admin module
echo "Creating admin module..."
npx nest generate module routes/admin --no-spec
npx nest generate service routes/admin --no-spec
npx nest generate controller routes/admin --no-spec

echo "✅ All modules generated successfully!"
echo ""
echo "📁 Generated modules:"
echo "   - Posts (content creation & management)"
echo "   - Comments (threaded discussions)"
echo "   - Votes (rating system)"
echo "   - Taxonomy (tags, levels, skills)"
echo "   - Search (full-text search & feed)"
echo "   - Moderation (content review)"
echo "   - Media (file uploads)"
echo "   - AI (language assistance)"
echo "   - Learning (artifacts & quizzes)"
echo "   - Admin (system management)"
echo ""
echo "🔧 Next steps:"
echo "   1. Implement service logic for each module"
echo "   2. Create DTOs for data validation"
echo "   3. Add proper error handling"
echo "   4. Implement authentication guards"
echo "   5. Add comprehensive testing"
