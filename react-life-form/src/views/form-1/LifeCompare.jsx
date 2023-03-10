import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { useStateContext } from "../../context/ContextProvider.jsx";
import axiosClient from "../../axios-client.js";
import LifeCompareItem from "./LifeCompareItem";
import "./lifeCompare.css";
import JsonJobs from "../../Jobs.json";

function LifeCompare() {
    const navigate = useNavigate();
    const { setNotification, setNext, setInsurancedId, token } =
        useStateContext();
    const [ServerErrors, setServerErrors] = useState(null);
    const cookies = new Cookies();
    const formData = cookies.get("formData") ? cookies.get("formData") : [];
    const [values, setValues] = useState({
        insurance_target: formData.insurance_target ?? "",
        birth_year: formData.birth_year ?? "",
        birth_month: formData.birth_month ?? "",
        birth_day: formData.birth_day ?? "",
        life_ins_duration: formData.life_ins_duration ?? "",
        payment_method: formData.payment_method ?? "",
        annual_payment: parseInt(formData.annual_payment ?? 0).toLocaleString(),
        first_job_level: formData.job ?? "",
        first_job_level_id: formData.job_id ?? "",
        second_job_level: "",
        second_job_level_id: "",
        divided_payment: (formData.annual_payment && formData.payment_method
            ? parseInt(formData.annual_payment / formData.payment_method)
            : 0
        ).toLocaleString(),
        annual_payment_increase: "",
        addon_payment_method: "",
        death_capital_any_reason_ratio: "",
        capital_increase: "",
        death_capital_incident_ratio: "",
        maim_ratio: "",
        has_medical_cost: "",
        additional_dangers: "",
        hospitalization: "",
        exemption: "",
        special_diseases_ratio: "",
    });
    const [errors, setErrors] = useState({
        insurance_target: "",
        birth_year: "",
        birth_month: "",
        birth_day: "",
        annual_payment: "",
        first_job_level: "",
        second_job_level: "",
    });
    const [disableds, setDisableds] = useState({
        maim_ratio: true,
        has_medical_cost: true,
        additional_dangers: true,
        hospitalization: true,
    });
    const [now, setNow] = useState(
        new DateObject({
            date: new Date(),
            calendar: persian,
            locale: persian_fa,
        })
    );
    const age = useRef(
        now.year -
            (values.birth_year ? values.birth_year : now.yaer) -
            (now.month > (values.birth_month ? values.birth_month : now.month)
                ? 1
                : 0) -
            (now.month ==
                (values.birth_month ? values.birth_month : now.month) &&
            now.day > (values.birth_day ? values.birth_day : now.day)
                ? 1
                : 0)
    );
    const [years, setYears] = useState([]);
    const [months, setMonths] = useState([]);
    const [days, setDays] = useState([]);
    const [durations, setDurations] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [firstJobResults, setFirstJobResults] = useState([]);
    const [secondJobResults, setSecondJobResults] = useState([]);
    const [capitalIncreases, setCapitalIncreases] = useState([]);
    const [capitalIncidents, setCapitalIncidents] = useState([]);

    useEffect(() => {
        setYears([...Array(66).keys()].map((i) => now.year - i));
        setMonths([...Array(12).keys()].map((i) => 12 - i));
        setDays(
            [...Array(values.birth_month <= 6 ? 31 : 30).keys()].map(
                (i) => (values.birth_month <= 6 ? 31 : 30) - i
            )
        );
        updateDurations();
        updateCapitalIncidents();
        try {
            axiosClient
                .get("/v1/update-jobs")
                .then(({ data }) => {
                    fetch(`${import.meta.env.VITE_BASE_URL}/src/Jobs.json`)
                        .then((response) => response.json())
                        .then((data) => {
                            setJobs(data);
                        });
                })
                .catch((err) => {
                    const response = err.response;
                    if (response) {
                        setServerErrors(err.response.data.errors);
                    }
                });
        } catch (error) {
            console.error("Jobs not loaded");
            setJobs([]);
        }
        setInsurancedId(null);
    }, []);

    const inputs = [
        {
            id: 1,
            type: "select",
            label: "????????",
            name: "insurance_target",
            errorMessage: ". ???????? ?????? ???? ???????? ????????!!",
            required: true,
            options: ["????????", "????????", "??????????", "??????", "????????", "??????????", "??????????"],
        },
        {
            id: 2,
            type: "select",
            label: "?????? ????????",
            name: "birth_year",
            errorMessage: ". ?????? ???????? ?????? ???? ???????? ???????? !!",
            required: true,
            options: years,
        },
        {
            id: 3,
            type: "select",
            label: "?????? ????????",
            name: "birth_month",
            errorMessage: ". ?????? ???????? ?????? ???? ???????? ???????? !!",
            required: true,
            options: months,
        },
        {
            id: 4,
            type: "select",
            label: "?????? ????????",
            name: "birth_day",
            errorMessage: ". ?????? ???????? ?????? ???? ???????? ???????? !!",
            required: true,
            options: days,
        },
        {
            id: 5,
            type: "select",
            label: "?????? ???????? ????????",
            name: "life_ins_duration",
            errorMessage: ". ?????? ???????? ???????? ???? ???????? ???????? !!",
            required: true,
            options: durations,
        },
        {
            id: 6,
            type: "input",
            label: "?????????? ?????? ??????",
            name: "first_job_level",
            placeholder: "?????????? ?????? ??????",
            errorMessage: ". ?????? ?????? ???? ???????????? ???????? !!",
            required: true,
            options: firstJobResults,
        },
        {
            id: 7,
            type: "input",
            label: "?????????? ?????? ??????",
            name: "second_job_level",
            placeholder: "?????????? ?????? ??????",
            errorMessage: ". ?????? ?????? ???? ???????????? ???????? !!",
            required: true,
            options: secondJobResults,
        },
        {
            id: 8,
            type: "select",
            label: "?????? ????????????",
            name: "payment_method",
            errorMessage: ". ?????? ???????????? ???? ???????????? ???????????? !!",
            required: true,
            options: [
                {
                    key: 1,
                    value: "?? ?????? ????????????",
                },
                {
                    key: 2,
                    value: "?? ?????? ???? ????????",
                },
                {
                    key: 4,
                    value: "?? ?????? ???? ????????",
                },
                {
                    key: 12,
                    value: "???? ?????? ????????????",
                },
            ],
        },
        {
            id: 9,
            type: "input",
            label: "???????? ?????????????? ?????? ??????",
            name: "annual_payment",
            placeholder: "???????? ?????????????? ???? ????????",
            errorMessage: ". ???????? ?????????????? ???????? ?????? ?????? ???? ???????? ???????? !!",
            required: true,
        },
        {
            id: 10,
            type: "input",
            label: "???????? ?????????????? ?????? ??????",
            name: "divided_payment",
            readOnly: true,
        },
        {
            id: 11,
            type: "select",
            label: "???????????? ???????????? ???? ????????",
            name: "annual_payment_increase",
            errorMessage: ". ???????????? ???????????? ???? ???????? ???? ???????????? ???????????? !!",
            required: true,
            options: [
                {
                    key: 0,
                    value: "0 %",
                },
                {
                    key: 10,
                    value: "10 %",
                },
                {
                    key: 15,
                    value: "15 %",
                },
                {
                    key: 20,
                    value: "20 %",
                },
                {
                    key: 25,
                    value: "25 %",
                },
            ],
        },
        {
            id: 12,
            type: "select",
            label: "???????? ???????????? ???? ???????? ???????? ?????? ??????????",
            name: "addon_payment_method",
            defaultValue: {
                key: "",
                value: "???????? ????????????",
            },
            errorMessage:
                ". ???????? ???????????? ???? ???????? ???????? ?????? ?????????? ???? ???????????? ???????????? !!",
            required: true,
            options: [
                {
                    key: 1,
                    value: "?????????????? ???????????? ??????????",
                },
                {
                    key: 2,
                    value: "???? ???? ???????? ?????????????? ?????? ????????",
                },
            ],
        },
        {
            id: 13,
            type: "select",
            label: "???????????? ?????? ???? ???? ??????",
            name: "death_capital_any_reason_ratio",
            defaultValue: {
                key: "",
                value: "???????????? ??????",
            },
            errorMessage: ". ???????????? ?????? ???? ???????????? ???????????? !!",
            required: true,
            options: [
                {
                    key: 1,
                    value: "1 ?????????? ???????????? ??????",
                },
                {
                    key: 2,
                    value: "2 ?????????? ???????????? ??????",
                },
                {
                    key: 3,
                    value: "3 ?????????? ???????????? ??????",
                },
                {
                    key: 4,
                    value: "4 ?????????? ???????????? ??????",
                },
                {
                    key: 5,
                    value: "5 ?????????? ???????????? ??????",
                },
                {
                    key: 6,
                    value: "6 ?????????? ???????????? ??????",
                },
                {
                    key: 7,
                    value: "7 ?????????? ???????????? ??????",
                },
                {
                    key: 8,
                    value: "8 ?????????? ???????????? ??????",
                },
                {
                    key: 9,
                    value: "9 ?????????? ???????????? ??????",
                },
                {
                    key: 10,
                    value: "10 ?????????? ???????????? ??????",
                },
                {
                    key: 11,
                    value: "11 ?????????? ???????????? ??????",
                },
                {
                    key: 12,
                    value: "12 ?????????? ???????????? ??????",
                },
                {
                    key: 13,
                    value: "13 ?????????? ???????????? ??????",
                },
                {
                    key: 14,
                    value: "14 ?????????? ???????????? ??????",
                },
                {
                    key: 15,
                    value: "15 ?????????? ???????????? ??????",
                },
                {
                    key: 16,
                    value: "16 ?????????? ???????????? ??????",
                },
                {
                    key: 17,
                    value: "17 ?????????? ???????????? ??????",
                },
                {
                    key: 18,
                    value: "18 ?????????? ???????????? ??????",
                },
                {
                    key: 19,
                    value: "19 ?????????? ???????????? ??????",
                },
                {
                    key: 20,
                    value: "20 ?????????? ???????????? ??????",
                },
                {
                    key: 21,
                    value: "21 ?????????? ???????????? ??????",
                },
                {
                    key: 22,
                    value: "22 ?????????? ???????????? ??????",
                },
                {
                    key: 23,
                    value: "23 ?????????? ???????????? ??????",
                },
                {
                    key: 24,
                    value: "24 ?????????? ???????????? ??????",
                },
                {
                    key: 25,
                    value: "25 ?????????? ???????????? ??????",
                },
            ],
        },
        {
            id: 14,
            type: "select",
            label: "???????????? ???????????? ????????????",
            name: "capital_increase",
            errorMessage: ". ?????????? ???????????? ???????????? ???? ???????? ???? ???????????? ???????????? !!",
            required: true,
            options: capitalIncreases,
        },
        {
            id: 15,
            type: "select",
            label: "?????? ???? ?????? ??????????",
            name: "death_capital_incident_ratio",
            defaultValue: {
                key: 0,
                value: "???????? ???? ???????????? ??????????",
            },
            options: capitalIncidents,
        },
        {
            id: 16,
            type: "select",
            label: "?????? ?????? ?? ???? ????????????????????",
            name: "maim_ratio",
            defaultValue: {
                key: 0,
                value: "???????? ???? ???????????? ??????????",
            },
            options: capitalIncidents,
        },
        {
            id: 17,
            type: "select",
            label: "?????????? ?????????? ???????? ???? ??????????",
            name: "has_medical_cost",
            defaultValue: {
                key: 0,
                value: "??????",
            },
            options: [
                {
                    key: 1,
                    value: "??????",
                },
            ],
        },
        {
            id: 18,
            type: "select",
            label: "???????? ???????????? ?????????? ??????????",
            name: "additional_dangers",
            defaultValue: {
                key: 0,
                value: "??????",
            },
            options: [
                {
                    key: 1,
                    value: "??????",
                },
            ],
        },
        {
            id: 19,
            type: "select",
            label: "?????????? ??????????",
            name: "hospitalization",
            defaultValue: {
                key: 0,
                value: "??????",
            },
            options: [
                {
                    key: 1,
                    value: "??????",
                },
            ],
        },
        {
            id: 20,
            type: "select",
            label: "???????????? ???? ???????????? ???? ????????",
            name: "exemption",
            defaultValue: {
                key: 0,
                value: "??????",
            },
            options: [
                {
                    key: 1,
                    value: "??????",
                },
            ],
        },
        {
            id: 21,
            type: "select",
            label: "?????????? ??????",
            name: "special_diseases_ratio",
            defaultValue: {
                key: 0,
                value: "???????? ???? ???????????? ??????????",
            },
            options: [
                {
                    key: 1,
                    value: "1 ?????????? ???????????? ??????",
                },
                {
                    key: 2,
                    value: "2 ?????????? ???????????? ??????",
                },
            ],
        },
        /*
            ,{
                id: 44,
                name: "password",
                type: "password",
                placeholder: "Password",
                errorMessage:
                    "Password should be 8-20 characters and include at least 1 letter, 1 number and 1 special character!",
                label: "Password",
                pattern: `^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,20}$`,
                required: true,
            },
            {
                id: 55,
                name: "confirmPassword",
                type: "password",
                placeholder: "Confirm Password",
                errorMessage: "Passwords don't match!",
                label: "Confirm Password",
                pattern: values.password,
                required: true,
            },
            */
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        // alert("?????? ?????? ????");
        if (values.first_job_level_id && values.second_job_level_id) {
            const payload = {
                insurance_target: values.insurance_target,
                birth_year: values.birth_year,
                birth_month: values.birth_month,
                birth_day: values.birth_day,
                life_ins_duration: values.life_ins_duration,
                payment_method: values.payment_method,
                annual_payment: values.annual_payment.replace(/,/g, ""),
                first_job_level: values.first_job_level,
                first_job_level_id: values.first_job_level_id,
                second_job_level: values.second_job_level,
                second_job_level_id: values.second_job_level_id,
                divided_payment: values.divided_payment.replace(/,/g, ""),
                annual_payment_increase: values.annual_payment_increase,
                addon_payment_method: values.addon_payment_method,
                death_capital_any_reason_ratio:
                    values.death_capital_any_reason_ratio,
                capital_increase: values.capital_increase,
                death_capital_incident_ratio:
                    values.death_capital_incident_ratio
                        ? values.death_capital_incident_ratio
                        : "0",
                maim_ratio: values.maim_ratio ? values.maim_ratio : "0",
                has_medical_cost: values.has_medical_cost
                    ? values.has_medical_cost
                    : "0",
                additional_dangers: values.additional_dangers
                    ? values.additional_dangers
                    : "0",
                hospitalization: values.hospitalization
                    ? values.hospitalization
                    : "0",
                exemption: values.exemption ? values.exemption : "0",
                special_diseases_ratio: values.special_diseases_ratio
                    ? values.special_diseases_ratio
                    : "0",
            };
            axiosClient
                .post("/life-compare", payload)
                .then(({ data }) => {
                    setNotification("?????? ?????????????? ???? ???????????? ?????????? ???? !");
                    setInsurancedId(data);
                    cookies.set("formData", [], { path: "/life-compare" });
                    setTimeout(() => {
                        !token && setNext("/life-medical-info");
                        navigate("/life-medical-info");
                    }, 100);
                })
                .catch((err) => {
                    const response = err.response;
                    if (response) {
                        setServerErrors(err.response.data.errors);
                    }
                });
            window.scrollTo({
                top: 100,
                behavior: "smooth",
            });
        } else {
            if (!values.first_job_level_id) {
                setValues({ ...values, first_job_level: "" });
                setErrors({
                    ...errors,
                    first_job_level:
                        ". ?????? ???? ???? ?????????? ???????????????? ???????????? ???????? !!",
                });
            } else if (!values.second_job_level_id) {
                setValues({ ...values, second_job_level: "" });
                setErrors({
                    ...errors,
                    second_job_level:
                        ". ?????? ???? ???? ?????????? ???????????????? ???????????? ???????? !!",
                });
            }
        }
    };

    const onChange = (e) => {
        setValues({ ...values, [e.target.name]: e.target.value });
        handleChange(e);
    };

    const handleChange = (e) => {
        switch (e.target.name) {
            case "insurance_target":
                handleInsuranceTarget(e);
                break;
            case "birth_year":
                handleBirth(e);
                break;
            case "birth_month":
                handleBirth(e);
                break;
            case "birth_day":
                handleBirth(e);
                break;
            case "payment_method":
                handlePaymentMethod(e);
                break;
            case "annual_payment":
                handleAnnualPayment(e);
                break;
            case "first_job_level":
                handleFirstJobLevel(e);
                break;
            case "second_job_level":
                handleSecondJobLevel(e);
                break;
            case "annual_payment_increase":
                handleAnnualPaymentIncrease(e);
                break;
            case "death_capital_incident_ratio":
                handleDeathCapitalIncidentRatio(e);
                break;
            case "has_medical_cost":
                handleHasMedicalCost(e);
                break;
            default:
                break;
        }
    };

    const updateAge = (e) => {
        age.current =
            now.year -
            (e.target.name == "birth_year"
                ? e.target.value
                    ? e.target.value
                    : now.year
                : values.birth_year
                ? values.birth_year
                : now.yaer) -
            (now.month <
            (e.target.name == "birth_month"
                ? e.target.value
                    ? e.target.value
                    : now.month
                : values.birth_month
                ? values.birth_month
                : now.month)
                ? 1
                : 0) -
            (now.month ==
                (e.target.name == "birth_month"
                    ? e.target.value
                        ? e.target.value
                        : now.month
                    : values.birth_month
                    ? values.birth_month
                    : now.month) &&
            now.day <
                (e.target.name == "birth_day"
                    ? e.target.value
                        ? e.target.value
                        : now.day
                    : values.birth_day
                    ? values.birth_day
                    : now.day)
                ? 1
                : 0);
        updateDurations();
    };

    const updateDurations = (e) => {
        age.current >= 59
            ? setDurations(
                  [...Array(66 - age.current).keys()].map((i) => 5 + i)
              )
            : age.current >= 49
            ? setDurations(
                  [...Array(77 - age.current).keys()].map((i) => 5 + i)
              )
            : age.current
            ? setDurations([...Array(26).keys()].map((i) => 5 + i))
            : [];
    };

    const updateDividedPayment = (e) => {
        if (e.target.name == "annual_payment") {
            setValues({
                ...values,
                [e.target.name]: parseInt(e.target.value.replace(/,/g, ""))
                    ? parseInt(
                          e.target.value.replace(/,/g, "")
                      ).toLocaleString()
                    : 0,
                divided_payment: parseInt(
                    values.payment_method
                        ? parseInt(e.target.value.replace(/,/g, "")) /
                              parseInt(values.payment_method)
                        : "0"
                ).toLocaleString(),
            });
        } else {
            setValues({
                ...values,
                [e.target.name]: e.target.value,
                divided_payment: parseInt(
                    e.target.value
                        ? parseInt(values.annual_payment.replace(/,/g, "")) /
                              parseInt(e.target.value)
                        : "0"
                ).toLocaleString(),
            });
        }
    };

    const updateCapitalIncidents = (e) => {
        const array = [];
        for (let i = 1; i <= (age.current >= 15 ? 4 : 1); i++) {
            array.push({
                key: i,
                value: i.toLocaleString() + " ?????????? ???????????? ??????",
            });
        }
        setCapitalIncidents(array);
    };

    const handleInsuranceTarget = (e) => {
        setErrors({ ...errors, [e.target.name]: "" });
        if (e.target.value == "????????") {
            if (age.current < 18) {
                setValues({ ...values, birth_year: "", [e.target.name]: "" });
                setErrors({
                    ...errors,
                    [e.target.name]:
                        ". ???? ?????? ???????? ???? 18 ?????? ??????. ?????? ???????????? ?????? ???? ???????? ???????? !!",
                });
                setDurations([]);
            }
        }
    };

    const handleBirth = (e) => {
        setErrors({ ...errors, [e.target.name]: "" });
        updateAge(e);
        updateCapitalIncidents(e);
        e.target.name == "birth_month" &&
            setDays(
                [...Array(e.target.value <= 6 ? 31 : 30).keys()].map(
                    (i) => (e.target.value <= 6 ? 31 : 30) - i
                )
            );
        if (age.current > 64) {
            setValues({ ...values, [e.target.name]: "" });
            setErrors({
                ...errors,
                [e.target.name]: ". ???????????? ???? 64 ?????? ?????? !!",
            });
            setDurations([]);
            setCapitalIncidents([]);
        } else if (age.current < 18) {
            if (values.insurance_target == "????????") {
                setValues({ ...values, [e.target.name]: "" });
                setErrors({
                    ...errors,
                    [e.target.name]:
                        ". ???? ?????? ???????? ???? 18 ?????? ??????. ?????? ???????????? ?????? ???? ???????? ???????? !!",
                });
                setDurations([]);
                setCapitalIncidents([]);
            }
        }
    };

    const handlePaymentMethod = (e) => {
        setErrors({ ...errors, annual_payment: "" });
        if (e.target.value == "12") {
            if (
                (values.annual_payment
                    ? values.annual_payment.replace(/,/g, "")
                    : 0) < 6000000
            ) {
                setValues({
                    ...values,
                    annual_payment: "",
                    divided_payment: "",
                });
                setErrors({
                    ...errors,
                    annual_payment:
                        ". ???????? ???????????? ???????????? ???????? ???????? ?????????? ???? 000'000'6 ???????? ???????? !!",
                });
            } else {
                updateDividedPayment(e);
            }
        } else {
            if (
                (values.annual_payment
                    ? values.annual_payment.replace(/,/g, "")
                    : 0) < 4000000
            ) {
                setValues({
                    ...values,
                    annual_payment: "",
                    divided_payment: "",
                });
                setErrors({
                    ...errors,
                    annual_payment: ". ?????????? ???????? 000'000'4 ???????? ???? ???????? !!",
                });
            } else {
                updateDividedPayment(e);
            }
        }
    };

    const handleAnnualPayment = (e) => {
        setErrors({ ...errors, [e.target.name]: "" });
        if (values.payment_method == "12") {
            if (e.target.value.replace(/,/g, "") < 6000000) {
                // setValues({
                //     ...values,
                //     payment_method: "",
                //     divided_payment: "",
                // });
                values.payment_method = "";
                values.divided_payment = "0";
                setErrors({
                    ...errors,
                    [e.target.name]:
                        ". ???????? ???????????? ???????????? ???????? ???????? ?????????? ???? 000'000'6 ???????? ???????? !!",
                });
            }
        } else {
            if (e.target.value.replace(/,/g, "") < 4000000) {
                // setValues({
                //     ...values,
                //     payment_method: "",
                //     divided_payment: "",
                // });
                values.payment_method = "";
                values.divided_payment = "0";
                setErrors({
                    ...errors,
                    [e.target.name]: ". ?????????? ???????? 000'000'4 ???????? ???? ???????? !!",
                });
            }
        }
        updateDividedPayment(e);
    };

    const handleFirstJobLevel = (e) => {
        setValues({
            ...values,
            first_job_level_id: "",
            first_job_level: e.target.value,
        });
        setErrors({
            ...errors,
            first_job_level: "",
        });
        setFirstJobResults(
            e.target.value.length > 2
                ? jobs.filter((value) => {
                      return value.caption
                          .toLowerCase()
                          .includes(e.target.value.toLowerCase());
                  })
                : []
        );
    };

    const handleSecondJobLevel = (e) => {
        setValues({
            ...values,
            second_job_level_id: "",
            second_job_level: e.target.value,
        });
        setErrors({
            ...errors,
            second_job_level: "",
        });
        setSecondJobResults(
            e.target.value.length > 2
                ? jobs.filter((value) => {
                      return value.caption
                          .toLowerCase()
                          .includes(e.target.value.toLowerCase());
                  })
                : []
        );
    };

    const onClickFirstJobResults = (e) => {
        setValues({
            ...values,
            first_job_level_id: e.target.value.toString(),
            first_job_level: e.target.innerHTML,
        });
        setFirstJobResults([]);
    };

    const onClickSecondJobResults = (e) => {
        setValues({
            ...values,
            second_job_level_id: e.target.value.toString(),
            second_job_level: e.target.innerHTML,
        });
        setSecondJobResults([]);
    };

    const handleAnnualPaymentIncrease = (e) => {
        const array = [];
        if (e.target.value)
            for (let i = 0; i <= e.target.value / 5 && i < 5; i++) {
                array.push({
                    key: i * 5,
                    value: (i * 5).toLocaleString() + " %",
                });
            }
        setCapitalIncreases(array);
    };

    const handleDeathCapitalIncidentRatio = (e) => {
        if (e.target.value && e.target.value != 0) {
            setDisableds({
                ...disableds,
                maim_ratio: false,
                has_medical_cost: false,
            });
        } else {
            setDisableds({
                ...disableds,
                maim_ratio: true,
                has_medical_cost: true,
                additional_dangers: true,
                hospitalization: true,
            });
            setValues({
                ...values,
                maim_ratio: "",
                has_medical_cost: "",
                additional_dangers: "",
                hospitalization: "",
                death_capital_incident_ratio: "",
            });
        }
    };

    const handleHasMedicalCost = (e) => {
        if (e.target.value && e.target.value != 0) {
            setDisableds({
                ...disableds,
                additional_dangers: false,
                hospitalization: false,
            });
        } else {
            setDisableds({
                ...disableds,
                additional_dangers: true,
                hospitalization: true,
            });
            setValues({
                ...values,
                has_medical_cost: "",
                additional_dangers: "",
                hospitalization: "",
            });
        }
    };

    return (
        <div className="life-compare">
            <form onSubmit={handleSubmit} className="life-compare-form">
                <h1 className="life-compare-h1">?????????????? ????????</h1>
                {ServerErrors && (
                    <div className="alert">
                        {Object.keys(ServerErrors).map((key) => (
                            <p key={key}>{ServerErrors[key][0]}</p>
                        ))}
                    </div>
                )}
                {inputs.map((input) => (
                    <LifeCompareItem
                        key={input.id}
                        {...input}
                        value={values[input.name]}
                        error={errors[input.name]}
                        disabled={disableds[input.name]}
                        onChange={onChange}
                        onClick={
                            input.name == "first_job_level"
                                ? onClickFirstJobResults
                                : input.name == "second_job_level" &&
                                  onClickSecondJobResults
                        }
                    />
                ))}
                <button className="life-compare-button">?????? ??????</button>
            </form>
        </div>
    );
}

export default LifeCompare;
