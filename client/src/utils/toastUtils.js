import toast from 'react-hot-toast';

export const notifySuccess = (msg) => toast.success(msg, { duration: 3000 });
export const notifyError = (msg) => toast.error(msg, { duration: 5000 });
export const notifyInfo = (msg) => toast(msg, { icon: 'ℹ️' });
