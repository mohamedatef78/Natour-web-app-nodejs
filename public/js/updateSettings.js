/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';


export const  updateData = async (data  , type)=>{
  console.log(data);
  try{
    const url = 
      type === 'password'
        ? 'http://localhost:3000/api/v1/users/updatepassword'
        : 'http://localhost:3000/api/v1/users/updateuserdata';
    const res = await axios({
      method:'PATCH',
      url,
      data
    });

    if(res.data.status==='success'){
      showAlert('success','data updata successfuly');
    }


  }catch(err){
    showAlert('error', err.response.data.message);
  }
}

// // type is either 'password' or 'data'
// export const updateSettings = async (data, type) => {
//   try {
//     const url =
//       type === 'password'
//         ? 'http://127.0.0.1:3000/api/v1/users/updateMyPassword'
//         : 'http://127.0.0.1:3000/api/v1/users/updateMe';

//     const res = await axios({
//       method: 'PATCH',
//       url,
//       data
//     });

//     if (res.data.status === 'success') {
//       showAlert('success', `${type.toUpperCase()} updated successfully!`);
//     }
//   } catch (err) {
//     showAlert('error', err.response.data.message);
//   }
// };
