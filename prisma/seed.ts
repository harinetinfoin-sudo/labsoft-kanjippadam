import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
const prisma = new PrismaClient()
async function main(){
  const email='admin@labsoft.com'
  const hash=await bcrypt.hash('admin123',10)
  await prisma.user.deleteMany({where:{email}})
  await prisma.user.create({
    data:{ email, name:'Admin', password:hash, role:'ADMIN' }
  })
  console.log('RESET DONE - ADMIN created')
}
main().finally(()=>prisma.$disconnect())