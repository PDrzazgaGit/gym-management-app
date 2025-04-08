import React from 'react';
import { Button, ButtonProps } from 'react-bootstrap';


export const StyledButton: React.FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <Button 
    variant="light" 
    className='border justify-content-center align-items-center d-flex'
    {...props}
    >
      {children}
    </Button>
  );
};
