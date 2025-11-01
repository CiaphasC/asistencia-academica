# 🎓 Sistema de Asistencia Académica

Un sistema completo de gestión de asistencia académica desarrollado con **Next.js**, **TypeScript**, **Supabase** y **Tailwind CSS**.

## 🚀 Características Principales

### 👥 **Gestión de Usuarios**
- **Estudiantes**: Registro de asistencia vía QR
- **Profesores**: Creación de sesiones y gestión de clases
- **Administradores**: Control total del sistema

### 📚 **Gestión Académica**
- **Mallas Curriculares**: Organización de programas académicos
- **Cursos**: Gestión completa de materias
- **Horarios**: Programación de clases y sesiones
- **Matriculación**: Inscripción de estudiantes en cursos

### ✅ **Sistema de Asistencia**
- **Códigos QR**: Generación automática para cada sesión
- **Validación en Tiempo Real**: Confirmación instantánea
- **Control de Ubicación**: Verificación por proximidad
- **Reportes Detallados**: Estadísticas y análisis

### 🎯 **Gestión de Eventos**
- **Eventos Académicos**: Conferencias, talleres, seminarios
- **Registro Público**: Inscripción mediante enlaces
- **Notificaciones**: Alertas automáticas por email

### 📊 **Reportes y Analytics**
- **Dashboards Interactivos**: Visualización en tiempo real
- **Estadísticas de Asistencia**: Por estudiante, curso y período
- **Exportación**: Datos en múltiples formatos

## 🛠️ **Stack Tecnológico**

### **Frontend**
- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utilitarios
- **Shadcn/ui** - Componentes de UI
- **Recharts** - Gráficos y visualizaciones

### **Backend**
- **Supabase** - Backend as a Service
- **PostgreSQL** - Base de datos relacional
- **Row Level Security (RLS)** - Seguridad a nivel de fila
- **Edge Functions** - Funciones serverless

### **Funcionalidades Avanzadas**
- **Autenticación JWT** - Sistema de login seguro
- **Real-time Updates** - Actualizaciones en tiempo real
- **QR Code Generation** - Generación dinámica de códigos
- **Email Notifications** - Sistema de notificaciones

## 🗄️ **Arquitectura de Base de Datos**

### **Tablas Principales**
```sql
personas              # Usuarios del sistema
├── auth_users        # Datos de autenticación
├── mallas_curriculares # Programas académicos
├── cursos            # Materias y asignaturas
├── horarios          # Programación de clases
├── matriculas        # Inscripciones
├── sesiones_clase    # Sesiones individuales
├── asistencia        # Registros de asistencia
├── eventos           # Eventos académicos
└── participantes_eventos # Participación en eventos
```

### **Edge Functions**
- **`generate-qr`** - Generación de códigos QR
- **`validate-qr`** - Validación de asistencia
- **`send-event-notification`** - Envío de notificaciones

## 🚀 **Instalación y Configuración**

### **Prerrequisitos**
- Node.js 18+ 
- pnpm (recomendado) o npm
- Cuenta en Supabase
- Git

### **1. Clonar el Repositorio**
```bash
git clone https://github.com/CiaphasC/asistencia-academica.git
cd asistencia-academica
```

### **2. Instalar Dependencias**
```bash
pnpm install
# o
npm install
```

### **3. Configurar Variables de Entorno**
Crear archivo `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

### **4. Configurar Supabase**
```bash
# Instalar Supabase CLI
npm install -g @supabase/cli

# Login en Supabase
supabase login

# Enlazar proyecto
supabase link --project-ref tu_project_ref

# Aplicar migraciones
supabase db push

# Desplegar Edge Functions
supabase functions deploy
```

### **5. Ejecutar en Desarrollo**
```bash
pnpm dev
# o
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## 📱 **Funcionalidades por Rol**

### **👨‍🎓 Estudiante**
- ✅ Registrar asistencia con QR
- 📊 Ver historial de asistencia
- 🎯 Inscribirse en eventos
- 📱 Acceso móvil optimizado

### **👨‍🏫 Profesor**
- 📝 Crear y gestionar cursos
- ⏰ Programar horarios
- 📊 Generar reportes de asistencia
- 🔗 Crear códigos QR para sesiones

### **👨‍💼 Administrador**
- 👥 Gestión completa de usuarios
- 📚 Configuración de mallas curriculares
- 📊 Acceso a todos los reportes
- ⚙️ Configuración del sistema

## 🔧 **Scripts Disponibles**

```bash
# Desarrollo
pnpm dev

# Construcción para producción
pnpm build

# Iniciar servidor de producción
pnpm start

# Linting
pnpm lint

# Formateo de código
pnpm format

# Despliegue a Supabase
pnpm deploy:supabase
```

## 📊 **Estructura del Proyecto**

```
asistencia-academica/
├── app/                    # App Router de Next.js
│   ├── (auth)/            # Rutas de autenticación
│   ├── admin/             # Panel administrativo
│   ├── asistencia/        # Módulo de asistencia
│   ├── eventos/           # Gestión de eventos
│   ├── horarios/          # Programación
│   ├── mallas-cursos/     # Currículo académico
│   ├── personas/          # Gestión de usuarios
│   └── reportes/          # Analytics y reportes
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes base (Shadcn)
│   ├── asistencia/       # Componentes de asistencia
│   ├── eventos/          # Componentes de eventos
│   └── ...               # Otros módulos
├── hooks/                 # Custom React hooks
├── lib/                   # Utilidades y configuración
│   └── supabase/         # Cliente de Supabase
├── supabase/             # Configuración de Supabase
│   ├── functions/        # Edge Functions
│   └── migrations/       # Migraciones de DB
└── types/                # Definiciones de TypeScript
```

## 🔐 **Seguridad**

- **Row Level Security (RLS)** habilitado en todas las tablas
- **Autenticación JWT** con Supabase Auth
- **Validación de entrada** en frontend y backend
- **Políticas de acceso** basadas en roles
- **Encriptación** de datos sensibles

## 🚀 **Despliegue**

### **Vercel (Recomendado)**
```bash
# Conectar con Vercel
npx vercel

# Configurar variables de entorno en Vercel Dashboard
```

### **Otras Plataformas**
- **Netlify**: Compatible con build commands
- **Railway**: Despliegue directo desde GitHub
- **AWS/GCP**: Usando contenedores Docker

## 📈 **Roadmap**

### **v2.0 - Próximas Características**
- [ ] 📱 Aplicación móvil (React Native)
- [ ] 🔔 Notificaciones push
- [ ] 📍 Geolocalización avanzada
- [ ] 🤖 Integración con IA para predicciones
- [ ] 📊 Dashboard ejecutivo avanzado
- [ ] 🔗 API pública para integraciones
- [ ] 📧 Sistema de mensajería interno

## 🤝 **Contribución**

1. Fork el repositorio
2. Crea una rama feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📝 **Licencia**

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 **Autor**

**CiaphasC**
- GitHub: [@CiaphasC](https://github.com/CiaphasC)
- Proyecto: [asistencia-academica](https://github.com/CiaphasC/asistencia-academica)

## 🙏 **Agradecimientos**

- [Next.js](https://nextjs.org/) - Framework React
- [Supabase](https://supabase.com/) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Shadcn/ui](https://ui.shadcn.com/) - Componentes de UI
- [Vercel](https://vercel.com/) - Plataforma de despliegue

---

⭐ **¡Si te gusta este proyecto, dale una estrella en GitHub!** ⭐