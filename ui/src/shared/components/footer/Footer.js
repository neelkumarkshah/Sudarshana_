import React from "react";

import classes from "./Footer.module.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={classes.footer}>
      <p>Copyright &copy; {currentYear} Sudarshana. All Rights Reserved.</p>
      {/* <div className={classes.footerContent}>
        <nav className={classes.footerNav}>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
        </nav>
      </div> */}
    </footer>
  );
};

export default Footer;
