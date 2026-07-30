"use client";

import DesignationForm from "../../../../../components/userSpecific/DesignationForm";

export default function CreateDesignationPage() {
  const intialData = {
    title:"",
    description: "",
    permissionIds: [],
    multipleAssignment: false
  }

  return <>
  <DesignationForm designation={intialData}/>
  </>
}