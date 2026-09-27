export const triggerFrontendUpdate = async ({tag = "",path=""}) => {
  const url = `${process.env.FRONTEND_URL}/api/revalidate?secret=${process.env.REVALIDATE_SECRET}${tag ? `&tag=${tag}` : ""}${path ? `&path=${path}` : ""}`;
  
  try {
    const res = await fetch(url, { method: 'POST' });
    const data = await res.json();
  } catch (error) {
  }
};  