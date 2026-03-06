import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const Footer = () => {
  const user = useSelector(state => state.auth.user);

  return (
    <footer className="w-full bg-slate-800 text-white py-6 border-t border-slate-700">
          <p className="text-gray-400 text-sm text-center">
            &copy; {new Date().getFullYear()} Eventora. All rights reserved.
          </p>
    </footer>
  );
};

export default Footer;
