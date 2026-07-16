import { prisma } from "./src/config/db";

async function main() {
    const departamento = await prisma.departamento.create(
        {
            data:{
                nombre:"Recursos Humanos"
            },
            include:{usuarios:false,maquinas:false}
        }
    )
  // Create a new user with a post
//   const user = await prisma.user.create({
//     data: {
//       name: "Alice",
//       email: "alice@prisma.io",
//       posts: {
//         create: {
//           title: "Hello World",
//           content: "This is my first post!",
//           published: true,
//         },
//       },
//     },
//     include: {
//       posts: true,
//     },
//   });
//   console.log("Created user:", user);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });