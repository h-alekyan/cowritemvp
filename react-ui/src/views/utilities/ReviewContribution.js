import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import { useParams } from 'react-router';

import { markdownDiff } from 'markdown-diff';


import configData from '../../config';
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
// import style manually
import 'react-markdown-editor-lite/lib/index.css';

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
    useMediaQuery
} from '@material-ui/core';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';
import axios from 'axios';

// project imports
import useScriptRef from '../../hooks/useScriptRef';
import AnimateButton from '../../ui-component/extended/AnimateButton';
import { strengthColor, strengthIndicator } from '../../utils/password-strength';

// assets
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

// style constant
const useStyles = makeStyles((theme) => ({
    redButton: {
        fontSize: '1rem',
        fontWeight: 500,
        backgroundColor: theme.palette.grey[50],
        border: '1px solid',
        borderColor: theme.palette.grey[100],
        color: theme.palette.grey[700],
        textTransform: 'none',
        '&:hover': {
            backgroundColor: theme.palette.primary.light
        },
        [theme.breakpoints.down('sm')]: {
            fontSize: '0.875rem'
        }
    },
    signDivider: {
        flexGrow: 1
    },
    signText: {
        cursor: 'unset',
        margin: theme.spacing(2),
        padding: '5px 56px',
        borderColor: theme.palette.grey[100] + ' !important',
        color: theme.palette.grey[900] + '!important',
        fontWeight: 500
    },
    loginIcon: {
        marginRight: '16px',
        [theme.breakpoints.down('sm')]: {
            marginRight: '8px'
        }
    },
    loginInput: {
        ...theme.typography.customInput
    }
}));

//===========================|| MY BOOKS SECTION ||===========================//

const ReviewContribution = ({...others}) => {

    let { id } = useParams();

    var Diff = require('text-diff');
    var diff = new Diff()
    const sw = require('stopword')
    

    const classes = useStyles();
    let history = useHistory();
    const scriptedRef = useScriptRef();
    const matchDownSM = useMediaQuery((theme) => theme.breakpoints.down('sm'));
    const [checked, setChecked] = React.useState(true);
    const account = useSelector((state) => state.account);
    const [content, setContent] = useState("")
    const [loaded, setLoaded] = useState(false)
    const [res, setRes] = useState('')
    const [percentage, setPercentage] = useState(0)

    const [strength, setStrength] = React.useState(0);
    const [level, setLevel] = React.useState('');

    const [book, setBook] = useState();
    const [contribution, setContribution] = useState();

    const useBeforeRender = (callback, deps) => {
        const [isRun, setIsRun] = useState(false);
    
        if (!isRun) {
            callback();
            setIsRun(true);
        }
    
        useEffect(() => () => setIsRun(false), deps);
    };
    
    const getBook = async (bookid) => {
        const { data } = await axios.get(configData.API_SERVER + 'get-book?book=' + bookid);
        setBook(data['book']);
        };
    
    const getContribution = async () => {
        const { data } = await axios.get(configData.API_SERVER + 'get-contribution?contrid=' + id);
        setContribution(data['contribution']);
        await getBook(data['contribution']['book_id'])
        setLoaded(true)
        setRes('true')
        };
    
    useBeforeRender(() => getContribution(), []);
    console.log(book)

    useEffect(() => {
        if(loaded){
            const body_raw = sw.removeStopwords(book['body'].split(' ')).join()
            const contr_raw = sw.removeStopwords(contribution['body'].split(' ')).join()
            console.log(body_raw)
            const diffres = diff.main(book['body'], contribution['body'])
            diff.cleanupSemantic(diffres)
            
            setRes(diff.prettyHtml(diffres))

            const diff_raw = diff.main(body_raw, contr_raw)
            const score = diff.levenshtein(diff_raw) / contr_raw.length
            setPercentage(score)
        }
    }, [loaded])

    
    
    
    





     // Initialize a markdown parser
     const mdParser = new MarkdownIt().set({html:true});

     function handleEditorChange({ html, text }) {
        setContent(text)
      }


     

   

  return(
    <React.Fragment>
        {loaded &&
        <Formik
                enableReinitialize ={true}
                initialValues={{
                    title: contribution['title'],
                    description: contribution['description'],
                    body: contribution['body'],
                    bookid: contribution['book_id'],
                    submit: null
                }}
                onSubmit={(values, { setErrors, setStatus, setSubmitting }) => {
                    try {
                        axios
                            .post( configData.API_SERVER + 'aprove-contribution',  { bookid: values.bookid, contrid: id,
                                title: values.title, body: values.body, description: values.description, percentage: percentage
                            }, { headers: { Authorization: `${account.token}` } })
                            .then(function (response) {
                                if (response.data.success) {
                                    console.log(response.data);
                                } else {
                                    setStatus({ success: false });
                                    setErrors({ submit: response.data.msg });
                                    setSubmitting(false);
                                }
                            })
                            .catch(function (error) {
                                setStatus({ success: false });
                                setErrors({ submit: error.response.data.msg });
                                setSubmitting(false);
                            });
                    } catch (err) {
                        console.error(err);
                    }
                }}
            >
                {({ initialValues, errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
                    <form noValidate onSubmit={handleSubmit} {...others}>
                        <Grid container spacing={matchDownSM ? 0 : 2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Title"
                                    margin="normal"
                                    name="title"
                                    id="title"
                                    type="text"
                                    value={values.title}
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    className={classes.loginInput}
                                    error={touched.username && Boolean(errors.username)}
                           
                                />
                                {touched.username && errors.username && (
                                    <FormHelperText error id="standard-weight-helper-text--register">
                                        {errors.username}
                                    </FormHelperText>
                                )}
                            </Grid>

                            <Grid item xs={12}
                            mb={3}>
                                <TextField
                                    fullWidth
                                    label="Description"
                                    margin="normal"
                                    name="description"
                                    id="description"
                                    type="text"
                                    value={values.description}
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    className={classes.loginInput}
                                    error={touched.username && Boolean(errors.username)}
                                />
                                {touched.username && errors.username && (
                                    <FormHelperText error id="standard-weight-helper-text--register">
                                        {errors.username}
                                    </FormHelperText>
                                )}
                            </Grid>
                        </Grid>
                        

                        {strength !== 0 && (
                            <FormControl fullWidth>
                                <Box
                                    sx={{
                                        mb: 2
                                    }}
                                >
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item>
                                            <Box
                                                backgroundColor={level.color}
                                                sx={{
                                                    width: 85,
                                                    height: 8,
                                                    borderRadius: '7px'
                                                }}
                                            ></Box>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="subtitle1" fontSize="0.75rem">
                                                {level.label}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </FormControl>
                        )}

                                   {res &&                  
                        <MdEditor style={{ height: '700px' }} renderHTML={text => mdParser.render(text)} onChange={handleEditorChange} defaultValue={res} />
                                   }

                        <Grid container alignItems="center" justifyContent="space-between">
                            <Grid item>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={checked}
                                            onChange={(event) => setChecked(event.target.checked)}
                                            name="checked"
                                            color="primary"
                                        />
                                    }
                                    label={
                                        <Typography variant="subtitle1">
                                            The suggested ownership for this contribution is &nbsp;
                                            <Typography variant="subtitle1" component={Link} to="#">
                                                {percentage.toPrecision(2)}% 
                                            </Typography>
                                        </Typography>
                                    }
                                />
                            </Grid>
                        </Grid>
                        {errors.submit && (
                            <Box
                                sx={{
                                    mt: 3
                                }}
                            >
                                <FormHelperText error>{errors.submit}</FormHelperText>
                            </Box>
                        )}
                        <Box
                            sx={{
                                mt: 2
                            }}
                        >
                            <AnimateButton>
                                <Button
                                    disableElevation
                                    disabled={isSubmitting}
                                    fullWidth
                                    size="large"
                                    type="submit"
                                    variant="contained"
                                    color="secondary"
                                >
                                    Approve
                                </Button>
                            </AnimateButton>
                        </Box>

                    </form>
                )}

            </Formik>
            }
          

    </React.Fragment>

  )

}

export default ReviewContribution

