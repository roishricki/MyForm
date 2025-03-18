"use client"
import React, { useState, useEffect } from 'react';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import Image from 'next/image';
import { AddOn, FormValues, PersonalInfo, PlanOption, Step } from '@/types/myForm';
import StepIndicator from './StepIndicator';
import Loader from './Loader';
import ErrorMsg from './ErrorMsg';
import ThankYou from '../../../public/assets/icon-thank-you.svg';

// Configuration data
const personalInfo: PersonalInfo[] = [
  { field: "name", label: "Name", placeholder: "e.g. Stephen King" },
  { field: "email", label: "Email Address", placeholder: "e.g. stephenking@lorem.com" },
  { field: "phone", label: "Phone Number", placeholder: "e.g. +1 234 567 890" },
];

const stepsConfig: Step[] = [
  { num: 1, title: 'YOUR INFO', subtitle: 'STEP 1' },
  { num: 2, title: 'SELECT PLAN', subtitle: 'STEP 2' },
  { num: 3, title: 'ADD-ONS', subtitle: 'STEP 3' },
  { num: 4, title: 'SUMMARY', subtitle: 'STEP 4' }
];

// Validation schemas
const validationSchemas = {
  personalInfo: Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email format').required('Email is required'),
    phone: Yup.string().required('Phone number is required')
  }),
  plan: Yup.object({
    planType: Yup.string().required('Please select a plan')
  }),
  addOns: Yup.object({
    addOns: Yup.array().of(Yup.string())
  })
};

const MyForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [planOptions, setPlanOptions] = useState<PlanOption[]>([]);
  const [addOnsConfig, setAddOnsConfig] = useState<AddOn[]>([]);
  const [defaultPlan, setDefaultPlan] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const totalSteps = stepsConfig.length + 1;

  // Fetch plans and add-ons from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [plansResponse, addonsResponse] = await Promise.all([
          fetch('/api/plans'),
          fetch('/api/addons')
        ]);

        if (!plansResponse.ok || !addonsResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const plansData = await plansResponse.json();
        const addons = await addonsResponse.json();
        const plans = plansData.plans
        
        
        setPlanOptions(plans);
        setAddOnsConfig(addons);
        
        if (plans.length > 0 && plansData.default_plan_id && plansData.default_plan_id.length > 0) {
          setDefaultPlan(plansData.default_plan_id[0].value);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load necessary data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const initialValues: FormValues = {
    name: '',
    email: '',
    phone: '',
    planType: defaultPlan,
    isYearly: false,
    addOns: []
  };

  // Helper function to get plan details by ID
  const getPlanById = (id: string): PlanOption | undefined => {
    return planOptions.find(plan => plan.id == id);
  };

  // Helper function to get addon details by ID
  const getAddonById = (id: string): AddOn | undefined => {
    return addOnsConfig.find(addon => addon.id == id);
  };

  // Helper function to calculate total price
  const calculateTotalPrice = (values: FormValues): number => {
    const plan = getPlanById(values.planType);
    if (!plan) return 0;
    
    const basePlanPrice = values.isYearly ? Number(plan.yearly_price) : Number(plan.monthly_price);
    
    const addOnsPrice = values.addOns.reduce((total, addonId) => {
      const addon = getAddonById(addonId);
      if (!addon) return total;
      return total + (values.isYearly ? Number(addon.yearly_price) : Number(addon.monthly_price));
    }, 0);
    
    return basePlanPrice + addOnsPrice;
  };

  const getValidationSchema = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        return validationSchemas.personalInfo;
      case 2:
        return validationSchemas.plan;
      case 3:
        return validationSchemas.addOns;
      default:
        return Yup.object({});
    }
  };

  const handleNextStep = async (
    values: FormValues, 
    setTouched: (fields: { [field: string]: boolean }, shouldValidate?: boolean) => void, 
    touched: { [field: string]: boolean },
    validateForm: () => Promise<any>
  ) => {
    const currentSchema = getValidationSchema(step);
    let fieldsToTouch: { [key: string]: boolean } = {};
    
    // Determine fields to mark as touched based on current step
    if (step === 1) {
      fieldsToTouch = { name: true, email: true, phone: true };
    } else if (step === 2) {
      fieldsToTouch = { planType: true };
    }
    
    setTouched({ ...touched, ...fieldsToTouch }, false);
  
    try {
      await currentSchema.validate(values, { abortEarly: false });
      const errors = await validateForm();
      if (Object.keys(errors).length === 0) {
        setStep(Math.min(step + 1, totalSteps));
      }
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const touchedFields: { [key: string]: boolean } = {};
        err.inner.forEach((error) => {
          if (error.path) {
            touchedFields[error.path] = true;
          }
        });
        setTouched({...touched, ...touchedFields}, true);
      }
    }
  };

  const handlePrevStep = () => {
    setStep(Math.max(step - 1, 1));
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        if (result.code === 'EMAIL_EXISTS') {
          throw new Error('This email address is already registered. Please use a different email.');
        } else {
          throw new Error('Failed to submit form');
        }
      }
  
      setIsSubmitted(true);
    } catch (error:any) {
      console.error('Error submitting form:', error);
      alert(error.message);
    } finally {
      setIsSubmitting(false);
      setStep(1);
    }
  };

  // Show loading state
  if (loading) {
    return <Loader msg='Loading form data...'/>
  }

  // Show error state
  if (error) {
    <ErrorMsg error={error}/>
  }

  return (
    <div className="min-h-screen bg-magnolia md:flex md:justify-center items-center">
      {/* Mobile Top Bar */}
      <div className="md:hidden w-full h-[172px] sidebar-bg-m bg-no-repeat bg-cover flex justify-center pt-8">
        <div className="flex space-x-4">
          {stepsConfig.map((stepData) => (
            <StepIndicator 
              key={stepData.num} 
              stepData={stepData} 
              isActive={step === stepData.num} 
              isMobile={true} 
            />
          ))}
        </div>
      </div>
      
      {/* Main Container */}
      <div className="w-full flex justify-center md:h-auto md:min-h-0 md:max-w-[1440px] md:my-0 md:items-center md:p-4">
        <div className="bg-white md:rounded-2xl md:shadow-lg md:flex md:flex-row md:overflow-hidden w-[min(100%,345px)] md:w-auto">
          {/* Desktop Sidebar - hidden on mobile */}
          <div className="hidden md:block p-6">
            <div className="sidebar-bg-d text-white p-12 relative h-full rounded-2xl">
              <div className="space-y-8 whitespace-nowrap">
                {stepsConfig.map(stepData => (
                  <StepIndicator 
                    key={stepData.num} 
                    stepData={stepData} 
                    isActive={step === stepData.num} 
                    isMobile={false} 
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Form content */}
          <div className="md:w-[600px] w-full flex flex-col items-center md:items-start">
            <div className="md:h-[600px] bg-white rounded-xl shadow-md md:shadow-none mx-4 -mt-[75px] md:mt-0 md:mx-0 p-6 md:p-10 w-full max-w-[345px] md:max-w-none md:w-full min-h-[400px] md:min-h-[500px]">
              <Formik
                initialValues={initialValues}
                validationSchema={getValidationSchema(step)}
                onSubmit={handleSubmit}
                enableReinitialize
              >
                {({ values, setTouched, touched, validateForm, errors }) => (
                  <Form id="multi-step-form" className=" flex flex-col justify-between">
                    {isSubmitted ? (
                        // Thank you content
                        <div className="flex flex-col items-center justify-center">
                          <div className="flex justify-center my-6">
                            <Image
                              className='h-[60px] w-[60px] md:h-[80px] w-[80px]'
                              src={ThankYou}
                              alt="thank-you-icon"
                            />
                          </div>
                          <h2 className="text-2xl md:text-3xl font-bold text-marine-blue mb-4 text-center">Thank you!</h2>
                          <p className="text-cool-gray mb-6 text-center max-w-md">
                            Thanks for confirming your subscription! We hope you have fun using our platform. 
                            If you ever need support, please feel free to email us at support@loremgaming.com.
                          </p>
                        </div>
                      ) : 
                    <div>
                      {/* Step 1: Personal Info */}
                      {step === 1 && (
                        <div className="w-full">
                          <h2 className="font-ubuntu text-2xl md:text-3xl font-bold text-marine-blue mb-2">Personal info</h2>
                          <p className="text-cool-gray mb-6">Please provide your name, email address, and phone number.</p>
                              {personalInfo.map((data: PersonalInfo) => (
                                <div key={data.field}>
                                  <div className="mb-4">
                                    <div className="flex justify-between">
                                      <label htmlFor={data.field} className="block text-sm text-marine-blue mb-1">{data.label}</label>
                                      {errors[data.field] && touched[data.field] && 
                                        <div className="font-bold text-strawberry-red text-xs">
                                          {errors[data.field] as string}
                                        </div>
                                      }
                                    </div>
                                    <Field
                                      type="text"
                                      name={data.field}
                                      id={data.field}
                                      placeholder={data.placeholder}
                                      className={`text-marine-blue font-medium p-3 w-full border ${
                                        errors[data.field] && touched[data.field] 
                                          ? 'border-strawberry-red' 
                                          : 'border-light-gray'
                                      } rounded-lg focus:outline-none focus:ring focus:ring-purplish-blue`}
                                    />
                                  </div>
                                </div>
                              ))}
                        </div>
                      )}
                      
                      {/* Step 2: Select Plan */}
                      {step === 2 && (
                        <div className="w-full">
                          <h2 className="text-2xl md:text-3xl font-bold text-marine-blue mb-2">Select your plan</h2>
                          <p className="text-cool-gray mb-6">You have the option of monthly or yearly billing.</p>
                          
                          <div className="space-y-4 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {planOptions.map(plan => (
                                <label 
                                  key={plan.id}
                                  className={`hover:border-purplish-blue border flex items-center md:flex-col md:p-4 p-2 rounded-lg cursor-pointer ${
                                    values.planType == plan.id ? 'border-purplish-blue bg-alabaster' : 'border-light-gray'
                                  }`}
                                >
                                  <Field
                                    type="radio"
                                    name="planType"
                                    value={plan.id}
                                    className="sr-only"
                                  />
                                  <div className="mr-4 md:mr-0 md:mb-10">
                                    <Image
                                      src={plan.icon_path}
                                      alt={`${plan.name}-icon`}
                                      width={40}
                                      height={40}
                                    />
                                  </div>
                                  <div>
                                    <p className="font-medium text-marine-blue">{plan.name}</p>
                                    <p className="text-cool-gray text-sm">
                                      {values.isYearly 
                                        ? `$${plan.yearly_price}/yr` 
                                        : `$${plan.monthly_price}/mo`
                                      }
                                    </p>
                                    <div className="h-5">
                                      {values.isYearly && <p className="text-marine-blue text-sm font-medium">2 months free</p>}
                                    </div>
                                  </div>
                                </label>
                              ))}
                            </div>
                            
                            {/* Billing toggle */}
                            <div className="flex items-center justify-center bg-alabaster p-3 rounded-lg mt-6">
                              <span className={`font-medium ${!values.isYearly ? 'text-marine-blue' : 'text-cool-gray'}`}>Monthly</span>
                              <label className="relative inline-flex items-center cursor-pointer mx-4">
                                <Field
                                  type="checkbox"
                                  name="isYearly"
                                  className="sr-only"
                                />
                                <div className={`w-12 h-6 bg-marine-blue rounded-full p-1`}>
                                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${values.isYearly ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                </div>
                              </label>
                              <span className={`font-medium ${values.isYearly ? 'text-marine-blue' : 'text-cool-gray'}`}>Yearly</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Step 3: Add-ons */}
                      {step === 3 && (
                        <div className="w-full">
                          <h2 className="text-2xl md:text-3xl font-bold text-marine-blue mb-2">Pick add-ons</h2>
                          <p className="text-cool-gray mb-6">Add-ons help enhance your gaming experience.</p>
                          
                          <div className="md:space-y-4 space-y-2">
                            {addOnsConfig.map(addon => (
                              <label 
                                key={addon.id}
                                className={`hover:border-purplish-blue flex items-center border p-4 rounded-lg cursor-pointer ${
                                  values.addOns.includes(addon.id.toString()) ? 'border-purplish-blue bg-alabaster' : 'border-light-gray'
                                }`}
                              >
                                <Field
                                  type="checkbox"
                                  name="addOns"
                                  value={addon.id.toString()}
                                  className="accent-purplish-blue h-5 w-5 text-purplish-blue border-light-gray rounded"
                                />
                                <div className="ml-4 flex-grow">
                                  <p className="font-medium text-marine-blue">{addon.name}</p>
                                  <p className="text-cool-gray text-sm">{addon.description}</p>
                                </div>
                                <span className="text-purplish-blue text-sm">
                                  {values.isYearly 
                                    ? `+$${addon.yearly_price}/yr` 
                                    : `+$${addon.monthly_price}/mo`
                                  }
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Step 4: Summary */}
                      {step === 4 && (
                        <div className="w-full">
                          <h2 className="text-2xl md:text-3xl font-bold text-marine-blue mb-2">Finishing up</h2>
                          <p className="text-cool-gray mb-6">Double-check everything looks OK before confirming.</p>
                          
                          <div className="bg-alabaster p-4 rounded-lg">
                            {/* Selected Plan Summary */}
                            <div className="flex justify-between items-center pb-3 border-b border-light-gray">
                              <div>
                                {(() => {
                                  const plan = getPlanById(values.planType);
                                  return (
                                    <>
                                      <p className="font-bold text-marine-blue">
                                        {plan?.name} ({values.isYearly ? 'Yearly' : 'Monthly'})
                                      </p>
                                      <button 
                                        type="button" 
                                        className="cursor-pointer hover:text-purplish-blue text-cool-gray underline text-sm" 
                                        onClick={() => setStep(1)}
                                      >
                                        Change
                                      </button>
                                    </>
                                  );
                                })()}
                              </div>
                              <p className="font-bold text-marine-blue">
                                {(() => {
                                  const plan = getPlanById(values.planType);
                                  if (!plan) return '';
                                  return values.isYearly 
                                    ? `$${plan.yearly_price}/yr` 
                                    : `$${plan.monthly_price}/mo`;
                                })()}
                              </p>
                            </div>
                            
                            {/* Selected Add-ons Summary */}
                            {values.addOns.length > 0 && (
                              <div className="pt-3 space-y-3">
                                {values.addOns.map(addonId => {
                                  const addon = getAddonById(addonId);
                                  if (!addon) return null;
                                  
                                  return (
                                    <div key={addonId} className="flex justify-between">
                                      <p className="text-cool-gray">{addon.name}</p>
                                      <p className="text-marine-blue">
                                        {values.isYearly 
                                          ? `+$${addon.yearly_price}/yr` 
                                          : `+$${addon.monthly_price}/mo`
                                        }
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          
                          {/* Total Summary */}
                          <div className="flex justify-between px-4 mt-4">
                            <p className="text-cool-gray">
                              Total ({values.isYearly ? 'per year' : 'per month'})
                            </p>
                            <p className="text-xl font-bold text-purplish-blue">
                              ${calculateTotalPrice(values)}/{values.isYearly ? 'yr' : 'mo'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>}
                    
                    {/* Desktop Navigation buttons */}
                    <div className={`hidden md:flex ${step > 1 ? 'justify-between' : 'justify-end'} mt-auto pt-10 pb-4`}>
                      {step > 1 && !isSubmitted && (
                        <button
                          type="button"
                          onClick={handlePrevStep}
                          className="cursor-pointer px-4 py-2 text-cool-gray font-medium rounded-md hover:text-marine-blue"
                        >
                          Go Back
                        </button>
                      )}
                      
                      {!isSubmitted && <button
                        type={step === totalSteps ? "submit" : "button"}
                        onClick={step === totalSteps 
                          ? undefined // Let form handle submit
                          : () => handleNextStep(values, setTouched, touched, validateForm)
                        }
                        disabled={isSubmitting}
                        className={`px-4 md:px-6 py-2 md:py-3 text-white font-medium rounded-md cursor-pointer 
                          ${step === totalSteps ? 'bg-purplish-blue hover:opacity-85' : 'bg-marine-blue hover:opacity-85'}`}
                      >
                        {step === totalSteps + 1 
                          ? isSubmitting ? 'Processing...' : 'Confirm' 
                          : 'Next Step'
                        }
                      </button>}
                    </div>
                    
                    {/* Mobile Navigation (fixed to bottom) */}
                    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white p-4 flex justify-between">
                      {step > 1 && !isSubmitted ? (
                        <button
                          type="button"
                          onClick={handlePrevStep}
                          className="cursor-pointer px-4 py-2 text-cool-gray font-medium rounded-md hover:text-marine-blue"
                        >
                          Go Back
                        </button>
                      ) : (
                        <div></div> /* Empty div to maintain the space */
                      )}
                        {!isSubmitted &&  <button
                        type={step === totalSteps ? "submit" : "button"}
                        onClick={step === totalSteps 
                          ? undefined // Let form handle submit
                          : () => handleNextStep(values, setTouched, touched, validateForm)
                        }
                        disabled={isSubmitting}
                        className={`px-5 py-3 text-white font-medium rounded-md cursor-pointer 
                          ${step === totalSteps ? 'bg-purplish-blue hover:opacity-90' : 'bg-marine-blue hover:opacity-90'}`}
                      >
                        {step === totalSteps 
                          ? isSubmitting ? 'Processing...' : 'Confirm' 
                          : 'Next Step'
                        }
                      </button>}
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyForm;