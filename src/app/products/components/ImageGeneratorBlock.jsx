// import { Button } from "@mui/material";
// import { useState } from "react";
// import { generateImage } from "services/api";

// export default function ImageGeneratorBlock() {
//   const [open, setOpen] = useState(false);
//   const [prompt, setPrompt] = useState("");
//   const [imageUrl, setImageUrl] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const handleGenerate = async () => {
//     if (!prompt.trim()) return;

//     try {
//       setLoading(true);

//       const res = await generateImage(prompt);

//       setImageUrl(res.data.imageUrl);

//     } catch (e) {
//       console.error("Image generation error", e);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ marginTop: 10 }}>
//       <Button onClick={() => setOpen(prev => !prev)}>
//         Згенерувати зображення
//       </Button>

//       {open && (
//         <div style={{ marginTop: 10 }}>
//           <div style={{ fontSize: 16, marginBottom: 5 }}>
//             Введіть інструкцію англійською:
//           </div>

//           <textarea
//             value={prompt}
//             onChange={(e) => setPrompt(e.target.value)}
//             placeholder="e.g. black hoodie print with anime dragon"
//             rows={3}
//             style={{
//               width: "100%",
//               padding: 8,
//               fontSize: 14,
//               resize: "vertical"
//             }}
//           />

//           <button
//             onClick={handleGenerate}
//             disabled={loading}
//             style={{ marginTop: 8 }}
//           >
//             {loading ? "Генерується..." : "Згенерувати"}
//           </button>
//         </div>
//       )}

//       {imageUrl && (
//         <div style={{ marginTop: 15 }}>
//           <img
//             src={imageUrl}
//             alt="generated"
//             style={{
//               maxWidth: 300,
//               borderRadius: 8
//             }}
//           />
//         </div>
//       )}
//     </div>
//   );
// }