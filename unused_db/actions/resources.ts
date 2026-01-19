// 'use server';

// import {
//   NewResourceParams,
//   insertResourceSchema,
//   resources,
// } from '@/unused_db/schema/resources';
// import { db } from '..';
// import { generateEmbeddings } from '../../app/lib/embedding';
// import { embeddings as embeddiingsTable } from '@/db/schema/embeddings';

// export const createResource = async (input: NewResourceParams) => {
//   try {
//     const { content } = insertResourceSchema.parse(input);
//     console.log('[DEBUG][createResource] Parsed content:', { content });
//     const [resource] = await db
//       .insert(resources)
//       .values({ content })
//       .returning();

//     const embeddings = await generateEmbeddings(content);
//     console.log('[DEBUG][createResource] generated embeddings:', { embeddings });
//     await db.insert(embeddiingsTable).values(
//       embeddings.map(e => ({
//         resourceId: resource.id,
//         ...e
//       })),
//     );
//     console.log('[DEBUG][createResource] Resource and embeddings inserted successfully:', { resourceId: resource.id });
//     return 'Resource successfully created and embedded.';
//   } catch (error) {
//     return error instanceof Error && error.message.length > 0 ? error.message : 'Error, please try again.'
//   }
// };