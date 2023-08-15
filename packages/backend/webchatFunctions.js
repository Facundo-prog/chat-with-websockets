/* eslint-disable no-undef */

export async function deleteOldMessages(db){
  const messages = await db.webchatMessage.findMany().catch((e) => console.log("[ERROR DB]:", e.message));
  if(messages.length < 40) return;

  const deletePromises = messages.map((record, i) => {
    if(i > 10) return;
    return db.webchatMessage.delete({
      where: {
        id: record.id,
      },
    }).catch((e) => console.log("[ERROR DB]:", e.message));
  });

  await Promise.all(deletePromises);
}