#!/usr/bin/env bash
#
# Deploy der Bienenmonaz-Website nach Production.
#
# WICHTIG: Immer DIESEN Weg nutzen. Ein einfaches `vercel --prod` erkennt die
# Serverless-Function `/api/contact` (das Kontaktformular) nicht und das Formular
# waere dann tot. Der prebuilt-Weg baut die Function lokal und laedt das fertige
# Ergebnis hoch.
#
# Voraussetzung (einmalig): in der Vercel-CLI angemeldet sein (`vercel login`)
# und das Projekt verknuepft (`vercel link`). RESEND_API_KEY ist bereits in den
# Vercel-Projekt-Einstellungen hinterlegt.
#
# Aufruf:  ./deploy.sh
#
set -euo pipefail
cd "$(dirname "$0")"

echo "→ Baue Projekt (inkl. /api/contact Function)…"
vercel build --prod --yes

echo "→ Deploye nach Production…"
vercel deploy --prebuilt --prod --yes

echo "✓ Fertig. Live: https://bienenmonaz.de"
echo "  Schnelltest:"
echo "    curl -s -X POST https://bienenmonaz.de/api/contact -H 'Content-Type: application/json' -d '{}'"
