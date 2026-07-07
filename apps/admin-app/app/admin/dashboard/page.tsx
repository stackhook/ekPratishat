import FollowUpToday from "../../../components/lead/FollowUpToday";
import GetMyLeads from "../../../components/lead/GetUserLeads";
import MyCommission from "../../../components/userSpecific/MyCommission";

export default function Dashboard(){
    return (
        <>  
            <MyCommission/>
            <FollowUpToday/>
            <GetMyLeads/>
        </>
    )
}