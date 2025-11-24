import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"

// Load env vars manually
const envPath = path.resolve(process.cwd(), ".env.local")
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8")
  envConfig.split("\n").forEach((line) => {
    const [key, value] = line.split("=")
    if (key && value) {
      process.env[key.trim()] = value.trim()
    }
  })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.")
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

const engineeringCourses = ["ISW-101", "ISW-204"]
const businessCourses = ["ADM-110", "ADM-205"]
const allCourseCodes = [...new Set([...engineeringCourses, ...businessCourses])]

const studentFirstNames = [
  "Ana",
  "Bruno",
  "Carla",
  "Diego",
  "Elena",
  "Felipe",
  "Gabriela",
  "Hector",
  "Isabel",
  "Jorge",
  "Karina",
  "Luis",
  "Marcela",
  "Nicolas",
  "Olivia",
  "Pablo",
  "Renata",
  "Sergio",
  "Tamara",
  "Valeria",
]

const studentLastNames = [
  "Acosta",
  "Bermudez",
  "Carrillo",
  "Dominguez",
  "Espinoza",
  "Fernandez",
  "Gonzalez",
  "Herrera",
  "Ibarra",
  "Juarez",
  "Lagos",
  "Mendoza",
  "Navarro",
  "Ortega",
  "Paredes",
  "Quintero",
  "Ramos",
  "Salazar",
  "Torres",
  "Vargas",
]

const teacherNames = [
  ["Adriana", "Lopez"],
  ["Bernardo", "Santos"],
  ["Camila", "Villalba"],
  ["Dario", "Escobar"],
  ["Esteban", "Silva"],
  ["Florencia", "Guevara"],
  ["Gustavo", "Aragon"],
  ["Helena", "Bustamante"],
  ["Ignacio", "Casas"],
  ["Julieta", "Delgado"],
  ["Leonardo", "Estrada"],
  ["Monica", "Fajardo"],
  ["Octavio", "Galindo"],
  ["Patricia", "Hidalgo"],
  ["Rafael", "Izquierdo"],
]

const teacherCourseRotation = [
  "ISW-101",
  "ISW-204",
  "ADM-110",
  "ADM-205",
  "ISW-101",
  "ISW-204",
  "ADM-110",
  "ADM-205",
  "ISW-101",
  "ISW-204",
  "ADM-110",
  "ADM-205",
  "ISW-101",
  "ADM-110",
  "ISW-204",
]

const adminUser = {
  role: "admin",
  tipo: "administrador",
  nombre: "Administrador",
  apellido: "Principal",
  email: "admin@sistema.demo",
  password: "Admin123!",
  cedula: "3000000001",
  telefono: "+593900000000",
  direccion: "Oficina Central 1",
  fecha_nacimiento: "1980-01-15",
  genero: "M",
  cursos: [],
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
}

function buildStudents() {
  const students = []

  for (let i = 0; i < 40; i++) {
    const first = studentFirstNames[i % studentFirstNames.length]
    const last = studentLastNames[Math.floor(i / studentFirstNames.length)]
    const slugFirst = slugify(first)
    const slugLast = slugify(last)
    const email = `${slugFirst}.${slugLast}${String(i + 1).padStart(2, "0")}@alumnos.demo`
    const cedula = `10${String(200000 + i)}`
    const telefono = `+5939${String(80000000 + i).padStart(8, "0")}`
    const direccion = `Calle ${i + 1} de Octubre`
    const birthYear = 2001 - (i % 6)
    const birthMonth = String((i % 12) + 1).padStart(2, "0")
    const birthDay = String((i % 26) + 1).padStart(2, "0")
    const birthdate = `${birthYear}-${birthMonth}-${birthDay}`
    const genero = i % 2 === 0 ? "F" : "M"
    const carrera = i < 20 ? "Ingeniería de Software" : "Administración de Empresas"
    const courseCodes = i < 20 ? engineeringCourses : businessCourses

    students.push({
      role: "estudiante",
      tipo: "estudiante",
      nombre: first,
      apellido: last,
      email,
      password: "Estudiante123!",
      cedula,
      telefono,
      direccion,
      fecha_nacimiento: birthdate,
      genero,
      carrera,
      cursos: courseCodes,
    })
  }

  return students
}

function buildTeachers() {
  return teacherNames.map(([first, last], index) => {
    const slugFirst = slugify(first)
    const slugLast = slugify(last)
    const email = `${slugFirst}.${slugLast}@docentes.demo`
    const cedula = `20${String(100000 + index)}`
    const telefono = `+5938${String(60000000 + index).padStart(8, "0")}`
    const direccion = `Avenida Docente ${index + 1}`
    const birthYear = 1985 - (index % 10)
    const birthMonth = String((index % 12) + 1).padStart(2, "0")
    const birthDay = String((index % 20) + 1).padStart(2, "0")
    const birthdate = `${birthYear}-${birthMonth}-${birthDay}`
    const genero = index % 2 === 0 ? "M" : "F"
    return {
      role: "docente",
      tipo: "profesor",
      nombre: first,
      apellido: last,
      email,
      password: "Docente123!",
      cedula,
      telefono,
      direccion,
      fecha_nacimiento: birthdate,
      genero,
      cursos: [teacherCourseRotation[index]],
    }
  })
}

async function waitForPersona(authId) {
  for (let attempt = 0; attempt < 15; attempt++) {
    const { data, error } = await supabase.from("personas").select("id").eq("auth_id", authId).maybeSingle()
    if (error) {
      console.error("Error fetching persona:", error)
      break
    }
    if (data?.id) {
      return data.id
    }
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
  return null
}

async function ensureAccount(userData) {
  const { email, password, role, tipo, nombre, apellido, cedula } = userData

  let authUserId = null
  let wasCreated = false

  // Try to create user first
  const createResult = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role,
      tipo,
      nombre,
      apellido,
      cedula,
    },
  })

  if (createResult.data.user) {
    authUserId = createResult.data.user.id
    wasCreated = true
  } else if (createResult.error && createResult.error.message.includes("already registered")) {
    // User exists, find ID
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 })
    if (listError) throw listError
    const existingUser = users.find(u => u.email === email)
    if (existingUser) {
      authUserId = existingUser.id
    }
  } else {
    throw createResult.error
  }

  if (!authUserId) {
    throw new Error(`No se pudo obtener el ID de auth para ${email}`)
  }

  const personaId = await waitForPersona(authUserId)

  if (!personaId) {
    throw new Error(`No se encontró la persona para ${email}`)
  }

  const now = new Date().toISOString()

  const personaUpdate = await supabase
    .from("personas")
    .update({
      telefono: userData.telefono,
      direccion: userData.direccion,
      fecha_nacimiento: userData.fecha_nacimiento,
      genero: userData.genero,
      validado: true,
      estado: "activo",
      fecha_validacion: now,
    })
    .eq("id", personaId)

  if (personaUpdate.error) {
    console.error("Error actualizando personas:", personaUpdate.error)
  }

  const authUpdate = await supabase
    .from("auth_users")
    .upsert(
      {
        id: authUserId,
        email,
        role,
        validado: true,
        estado: "activo",
        razon_rechazo: null,
        updated_at: now,
      },
      { onConflict: "id" },
    )

  if (authUpdate.error) {
    console.error("Error actualizando auth_users:", authUpdate.error)
  }

  if (role === "docente") {
    const solicitudUpdate = await supabase
      .from("solicitudes_validacion")
      .update({ estado: "aprobado", fecha_resolucion: now, motivo_rechazo: null })
      .eq("persona_id", personaId)
      .eq("estado", "pendiente")

    if (solicitudUpdate.error) {
      console.error("Error actualizando solicitud:", solicitudUpdate.error)
    }
  }

  return { authUserId, personaId, wasCreated }
}

async function ensureMatriculas(personaId, cursosIds) {
  if (!cursosIds.length) return
  const payload = cursosIds.map((cursoId) => ({
    estudiante_id: personaId,
    curso_id: cursoId,
    periodo_academico: "2025-I",
    estado: "activo",
  }))

  const { error } = await supabase.from("matriculas").upsert(payload, {
    onConflict: "estudiante_id,curso_id,periodo_academico",
  })

  if (error) {
    console.error("Error upsert matriculas:", error)
  }
}

async function assignCourseTeachers(assignments, courseMap) {
  const updated = new Set()
  for (const assignment of assignments) {
    if (updated.has(assignment.course)) continue
    const cursoId = courseMap.get(assignment.course)
    if (!cursoId) continue
    const { error } = await supabase.from("cursos").update({ docente_id: assignment.personaId }).eq("id", cursoId)
    if (error) {
      console.error(`Error asignando docente al curso ${assignment.course}:`, error)
    }
    updated.add(assignment.course)
  }
}

async function main() {
  const { data: cursos, error: cursosError } = await supabase.from("cursos").select("id, codigo")
  if (cursosError) {
    throw cursosError
  }

  const courseMap = new Map(cursos.map((curso) => [curso.codigo, curso.id]))
  for (const code of allCourseCodes) {
    if (!courseMap.has(code)) {
      throw new Error(`No se encontró el curso con código ${code}. Ejecuta las migraciones antes del seed.`)
    }
  }

  const students = buildStudents()
  const teachers = buildTeachers()

  console.log("Creando/actualizando admin...")
  try {
    const { wasCreated } = await ensureAccount(adminUser)
    console.log(wasCreated ? "  ✔ Admin creado" : "  ℹ Admin ya existía")
  } catch (error) {
    console.error("  ✖ Error creando admin:", error)
  }

  console.log(`Creando/actualizando ${students.length} estudiantes...`)
  for (const [index, student] of students.entries()) {
    try {
      const { wasCreated, personaId } = await ensureAccount(student)
      console.log(`  ✔ Estudiante ${index + 1}/${students.length}: ${student.email}${wasCreated ? "" : " (actualizado)"}`)
      const cursoIds = student.cursos.map((code) => courseMap.get(code)).filter((id) => Boolean(id))
      await ensureMatriculas(personaId, cursoIds)
    } catch (error) {
      console.error(`  ✖ Error con estudiante ${student.email}:`, error)
    }
  }

  console.log(`Creando/actualizando ${teachers.length} docentes...`)
  const docenteAssignments = []

  for (const [index, teacher] of teachers.entries()) {
    try {
      const { wasCreated, personaId } = await ensureAccount(teacher)
      docenteAssignments.push({ course: teacher.cursos[0], personaId })
      console.log(`  ✔ Docente ${index + 1}/${teachers.length}: ${teacher.email}${wasCreated ? "" : " (actualizado)"}`)
    } catch (error) {
      console.error(`  ✖ Error con docente ${teacher.email}:`, error)
    }
  }

  console.log("Asignando docentes a cursos...")
  await assignCourseTeachers(docenteAssignments, courseMap)

  console.log("Seed completado. Puedes iniciar sesión con los usuarios generados.")
}

main()
  .then(() => {
    console.log("Listo.")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Seed falló:", error)
    process.exit(1)
  })
