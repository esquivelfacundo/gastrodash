#!/bin/bash

# Script para iniciar el sistema completo GastroDash Multi-Tenant

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║     GASTRODASH MULTI-TENANT - INICIALIZACIÓN COMPLETA    ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Función para verificar si un puerto está en uso
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        return 0
    else
        return 1
    fi
}

# 1. Verificar PostgreSQL
echo -e "${CYAN}[1/4] Verificando PostgreSQL...${NC}"
if systemctl is-active --quiet postgresql; then
    echo -e "${GREEN}✅ PostgreSQL está corriendo${NC}"
else
    echo -e "${YELLOW}⚠️  PostgreSQL no está corriendo. Intentando iniciar...${NC}"
    sudo systemctl start postgresql
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ PostgreSQL iniciado correctamente${NC}"
    else
        echo -e "${RED}❌ Error al iniciar PostgreSQL${NC}"
        exit 1
    fi
fi

# 2. Verificar Backend
echo ""
echo -e "${CYAN}[2/4] Verificando Backend (Puerto 3007)...${NC}"
if check_port 3007; then
    echo -e "${GREEN}✅ Backend ya está corriendo en puerto 3007${NC}"
else
    echo -e "${YELLOW}⚠️  Backend no está corriendo. Iniciando...${NC}"
    cd back
    npm start > /dev/null 2>&1 &
    BACKEND_PID=$!
    sleep 3
    
    if check_port 3007; then
        echo -e "${GREEN}✅ Backend iniciado correctamente (PID: $BACKEND_PID)${NC}"
    else
        echo -e "${RED}❌ Error al iniciar Backend${NC}"
        exit 1
    fi
    cd ..
fi

# 3. Verificar Frontend
echo ""
echo -e "${CYAN}[3/4] Verificando Frontend (Puerto 5173)...${NC}"
if check_port 5173; then
    echo -e "${GREEN}✅ Frontend ya está corriendo en puerto 5173${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend no está corriendo. Iniciando...${NC}"
    cd front
    npm run dev > /dev/null 2>&1 &
    FRONTEND_PID=$!
    sleep 3
    
    if check_port 5173; then
        echo -e "${GREEN}✅ Frontend iniciado correctamente (PID: $FRONTEND_PID)${NC}"
    else
        echo -e "${RED}❌ Error al iniciar Frontend${NC}"
        exit 1
    fi
    cd ..
fi

# 4. Test de API
echo ""
echo -e "${CYAN}[4/4] Verificando API...${NC}"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3007/api/status)
if [ "$RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ API respondiendo correctamente${NC}"
else
    echo -e "${YELLOW}⚠️  API no responde (código: $RESPONSE)${NC}"
fi

# Resumen
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                    SISTEMA INICIADO                       ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}✅ PostgreSQL:${NC} Corriendo"
echo -e "${GREEN}✅ Backend:${NC}    http://localhost:3007"
echo -e "${GREEN}✅ Frontend:${NC}   http://localhost:5173"
echo ""
echo -e "${CYAN}📝 Credenciales de prueba:${NC}"
echo "   Email:    admin@plazanadal.com"
echo "   Password: plaza2024"
echo ""
echo -e "${CYAN}🔗 URLs importantes:${NC}"
echo "   Frontend:  http://localhost:5173"
echo "   Backend:   http://localhost:3007"
echo "   API Docs:  http://localhost:3007/api/status"
echo ""
echo -e "${YELLOW}Para detener el sistema:${NC}"
echo "   ./stop_system.sh"
echo ""
