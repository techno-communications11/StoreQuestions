// import React, { useEffect, useState } from "react";
// import { UserProvider } from "../Auth/UserContext";
// import {
//   FaImage,
//   FaSpinner,
//   FaExclamationTriangle,
//   FaCheck,
//   FaTimes,
 
// } from "react-icons/fa";
// import "./Styles/UploadedData.css";

// const UploadedData = () => {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const { userData } = UserProvider(); //importing the user data from usercontext
//   const id = userData?.id; //getting the id from user data

//   useEffect(() => {
//     //useEfect is a hook to fetch data or subscription or highligt
//     const fetchMarketData = async () => {
//       //declaring the function of es6 witha async to get rid of callbackhell
//       setLoading(true); //setting the loading to true
//       setError(null); //setting error to null

//       try {
//         const response = await fetch(
//           `${process.env.REACT_APP_BASE_URL}/uploadeddata`,
//           {
//             //api to get response from server  with await means it waits until the response
//             method: "POST", //post method in crud operarions
//             headers: {
//               "Content-Type": "application/json", //header that we need to make sure only send the json format to send data
//             },
//             body: JSON.stringify({ id }), //converting the data to json
//             credentials: "include",
//           }
//         );

//         const result = await response.json(); //converting the json to  js object

//         if (result.success) {
//           //check  the result is success or not
//           setData(result.data); //setting the data
//           console.log(result.data);
//         } else {
//           setError(result.message || "No data found for this user");
//         }
//       } catch (err) {
//         setError("Error fetching data: " + err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (id) {
//       //if id
//       fetchMarketData(); //call the function
//     } else {
//       setError("User ID not found in token");
//       setLoading(false);
//     }
//   }, [id]); //for useEffect it is dependency

//   const handleImageClick = (imageUrl) => {
//     //es6 function
//     window.open(imageUrl, "_blank"); //to open in new window
//   };

//   if (loading)
//     return (
//       <div
//         className="d-flex justify-content-center align-items-center"
//         style={{ height: "100vh" }}
//       >
//         <FaSpinner
//           className="spinner-border text-pink"
//           style={{ color: "#FF69B4", width: "3rem", height: "3rem" }}
//         />
//       </div>
//     );

//   if (error)
//     return (
//       <div
//         className="alert alert-danger m-4 d-flex align-items-center"
//         role="alert"
//       >
//         <FaExclamationTriangle className="me-2" />
//         Error: {error}
//       </div>
//     );

//   return (
//     <div
//       className="container-fluid py-2 px-1"
//       style={{ backgroundColor: "#FFF5F7" }}
//     >
//       <div
//         className="card shadow-lg border-0 rounded-lg"
//         style={{ backgroundColor: "white" }}
//       >
//         <div className="card-header bg-white border-bottom-0 pt-4">
//           <div className="d-flex justify-content-center align-items-center flex-wrap">
//             <h1 className="mb-3 mb-md-0" style={{ color: "#FF69B4" }}>
//               <FaImage className="me-2" />
//               Uploaded Data
//             </h1>
//           </div>
//         </div>

//         <div className="card-body">
//           {data.length > 0 ? (
//             <div
//               className="table-responsive"
//               style={{ maxHeight: "520px", overflowY: "auto" }}
//             >
//               <table className="table table-hover">
//                 <thead className="sticky-header ">
//                   <tr className="text-center">
//                     {["SI.No", "NTID", "Created At", " Question", "Image"].map(
//                       (item, index) => (
//                         <th
//                           key={index}
//                           className="text-white"
//                           style={{ backgroundColor: "#E10174" }}
//                         >
//                           {item}
//                         </th>
//                       )
//                     )}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {data
//                     .sort(
//                       (a, b) => new Date(b.createdat) - new Date(a.createdat)
//                     )
//                     .map((item, index) => (
//                       <tr key={item.id} className="text-center">
//                         <td className="py-3">{index + 1}</td>
//                         <td className="py-3">{item.ntid}</td>
//                         <td className="py-3">
//                           {item.image_verified === null && (
//                             <span className="badge bg-warning">
//                               not verified
//                             </span>
//                           )}
//                           {item.image_verified === "yes" &&
//                             item.image_verified !== null && (
//                               <FaCheck className="text-success" />
//                             )}
//                           {item.image_verified === "no" &&
//                             item.image_verified !== null && (
//                               <FaTimes className="text-danger" />
//                             )}
//                         </td>
//                         <td className="py-3">
//                           {new Date(item.createdat).toLocaleString()}
//                         </td>
//                         <td className="py-3">{item.question}</td>
//                         <td className="py-3">
//                           <button
//                             className="btn btn-link p-0"
//                             onClick={() => handleImageClick(item.signedUrl)}
//                             title="View Image"
//                           >
//                             <FaImage
//                               size={24}
//                               style={{ color: "#FF69B4" }}
//                               className="hover-scale"
//                             />
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                 </tbody>
//               </table>
//             </div>
//           ) : (
//             <div className="text-center py-5">
//               <FaExclamationTriangle size={48} className="text-muted mb-3" />
//               <p className="h5 text-muted">No data available</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UploadedData;
