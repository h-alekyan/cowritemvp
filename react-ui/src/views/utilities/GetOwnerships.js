import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import configData from '../../config';

import { useParams } from 'react-router';


// material-ui
import { makeStyles } from '@material-ui/styles';
import {
    Box,
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    FormHelperText,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    TextField,
    Typography,
    useMediaQuery,
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Card
} from '@material-ui/core';


// third party
import * as Yup from 'yup';
import { Formik } from 'formik';
import axios from 'axios';

// project imports
import useScriptRef from '../../hooks/useScriptRef';
import AnimateButton from '../../ui-component/extended/AnimateButton';
import { strengthColor, strengthIndicator } from '../../utils/password-strength';

import { useTheme } from '@material-ui/styles';


// assets
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';



//===========================|| GET OWNERSHIP SECTION ||===========================//

const GetOwnerships = ({...others}) => {
    const account = useSelector((state) => state.account);
    const [expanded, setExpanded] = useState(false);
    const [contribution, setContribution] = useState()
    const [loaded, setLoaded] = useState(false)

    const { id } = useParams()

    const [books, setBooks] = useState([]);

    const useBeforeRender = (callback, deps) => {
        const [isRun, setIsRun] = useState(false);
    
        if (!isRun) {
            callback();
            setIsRun(true);
        }
    
        useEffect(() => () => setIsRun(false), deps);
    };

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
      };


    
    const getBooks = async () => {
        const { data } = await axios.get(configData.API_SERVER + 'get-ownerships?bookid='+id, { headers: { Authorization: `${account.token}` } })
        setBooks(data["ownerships"]);
        
    };



  


    useBeforeRender(() => getBooks(), []);



  return(
      <div> 
          {books &&
          <div>
                {books.map((book) => {
                return (
                    <Accordion expanded={expanded === book.id} onChange={handleChange(book['id'])}>
                        <AccordionSummary
                            aria-controls="panel1bh-content"
                            id="panel1bh-header"
                            fullwidth
                            >
                        <Typography sx={{ width: '33%', flexShrink: 0 }}>
                            {book['percentage']}
                        </Typography>
                        <Typography sx={{ color: 'text.secondary' }}> {book['username']}'s Contribution</Typography>
                    </AccordionSummary>

                    </Accordion>
                    
                )
            })} </div> }
        
      
      </div>

  )


}

export default GetOwnerships

