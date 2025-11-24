
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
  console.error("Missing env vars")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function checkUser(email) {
  console.log(`Checking user: ${email}`)
  // Use listUsers to find by email
  const { data, error } = await supabase.auth.admin.listUsers()
  
  if (error) {
    console.error("Error fetching users:", error)
    return
  }

  const user = data.users.find(u => u.email === email)

  if (!user) {
    console.log("User not found in Auth.")
  } else {
    console.log("User found in Auth:")
    console.log(`- ID: ${user.id}`)
    console.log(`- Email: ${user.email}`)
    console.log(`- Confirmed: ${user.email_confirmed_at}`)
    console.log(`- Last Sign In: ${user.last_sign_in_at}`)
    console.log(`- Metadata:`, user.user_metadata)
    
    // Check public tables
    const { data: authUser, error: authUserError } = await supabase
      .from("auth_users")
      .select("*")
      .eq("id", user.id)
      .single()
      
    if (authUserError) console.error("Error fetching public.auth_users:", authUserError)
    else console.log("public.auth_users entry:", authUser)
  }
}

checkUser("adriana.lopez@docentes.demo")
