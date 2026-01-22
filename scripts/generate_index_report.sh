#!/bin/bash
# Generates a report of all files in the project to meta/INDEX_REPORT.md

OUTPUT="meta/INDEX_REPORT.md"

echo "# Project Index Report" > $OUTPUT
echo "Generated on $(date)" >> $OUTPUT
echo "" >> $OUTPUT

echo "## File Structure" >> $OUTPUT
echo "\`\`\`" >> $OUTPUT
if command -v tree &> /dev/null; then
    tree -I 'node_modules|dist|.git|.DS_Store' >> $OUTPUT
else
    find . -maxdepth 3 -not -path '*/.*' -not -path './node_modules*' -not -path './client/node_modules*' -not -path './server/node_modules*' >> $OUTPUT
fi
echo "\`\`\`" >> $OUTPUT

echo "Index generated at $OUTPUT"
