import { LoaderArgs, json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { useState } from "react";
import { toast } from "react-toastify";
import { userPrefs } from "~/cookies";
import { ApiCall } from "~/services/api";


export async function loader(params: LoaderArgs) {
    const cookieHeader = params.request.headers.get("Cookie");
    const cookie: any = await userPrefs.parse(cookieHeader);
    const data = await ApiCall({
        query: `
      query getAllLicense{
        getAllLicense{
          id,
          licenseType,
          paymentAmount,
          discountAmount,
          discountValidTill,
          questionAllowed,
          projectPerLicense,
          status
        }
      }
    `,
        veriables: {},
        headers: { authorization: `Bearer ${cookie.token}` },
    });

    return json({
        license: data.data.getAllLicense,
        token: cookie.token,
        user: cookie
    });
}

const license: React.FC = (): JSX.Element => {

    const loader = useLoaderData();
    const user = loader.user;
    const token = loader.token;
    const license = loader.license;
    const [licenseBox, setLicenseBox] = useState<boolean>(false);
    const [licenaseid, setLicenaseid] = useState<any>(null);

    const navigator = useNavigate();

    const purchase = async () => {
        if (licenaseid == null || licenaseid == undefined) toast.error("Select the licenas plain.", { theme: "dark" });
        var date = new Date();
        date.setDate(date.getDate() + 30);

        const data = await ApiCall({
            query: `
            mutation createLicenseSlave($createLicenseslaveInput:CreateLicenseslaveInput!){
                createLicenseSlave(createLicenseslaveInput:$createLicenseslaveInput){
                    id,
                }
              }
            `,
            veriables: {
                "createLicenseslaveInput": {
                    "licenseTypeId": licenaseid.id,
                    "paymentStatus": "ACTIVE",
                    "licenseValidity": date,
                    "userId": Number(user.id),
                    "paymentReference": "SoMe_RaNdOm",
                    "paymentAmount": licenaseid.paymentAmount,
                    "status": "ACTIVE"
                }
            },
            headers: { authorization: `Bearer ${token}` },
        });
        if (data.status) {
            navigator("/home");
        } else {
            toast.error(data.message, { theme: "light" });
        }
    }

    return (
        <>
            <div className={`fixed top-0 left-0 bg-black bg-opacity-50 min-h-screen w-full z-50 ${licenseBox ? "grid place-items-center" : "hidden"}`}>
                <div className="bg-white p-4 rounded-md w-80">
                    <h3 className="text-2xl text-center font-semibold">Are you sure you want to continue with this license?</h3>
                    <div className="w-full h-[2px] bg-gray-800 my-4"></div>
                    <div className="flex flex-wrap gap-6 mt-4">
                        <button
                            onClick={purchase}
                            className="py-1 w-full sm:w-auto text-white text-lg px-4 bg-green-500 text-center rounded-md font-medium grow"
                        >
                            Yes
                        </button>
                        <button
                            onClick={() => setLicenseBox(val => false)}
                            className="py-1 w-full sm:w-auto text-white text-lg px-4 bg-rose-500 text-center rounded-md font-medium grow"
                        >
                            No
                        </button>
                    </div>
                </div>
            </div>
            <div className="min-h-screen w-full bg-primary-800 pt-40">
                <h1 className="mx-auto text-white font-medium text-center w-4/5 text-6xl">Choose the plan according to your need you need</h1>
                <div className="w-4/5 flex gap-2 mx-auto mt-6">
                    <div className="h-[2px] w-full mx-auto bg-white rounded-full"></div>
                    <div className="h-[2px] w-20 mx-auto bg-white rounded-full"></div>
                    <div className="h-[2px] w-full mx-auto bg-white rounded-full"></div>
                </div>
                <p className="w-4/5 mx-auto my-6 text-gray-200 text-lg text-center">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Repudiandae soluta, enim voluptas eligendi, quibusdam possimus ad facilis harum neque ipsum quasi! Quod perferendis molestiae consequatur</p>
                <div className="flex sm:w-4/5 mx-auto justify-center my-8 flex-wrap gap-10">
                    {license == null || license == undefined ? (
                        <>
                            <p className="text-secondary font-semibold text-2xl my-4 rounded-md border-l-4 px-2 py-2 bg-secondary bg-opacity-20 border-secondary w-full">
                                There is no license.
                            </p>
                        </>
                    ) : (
                        license.map((val: any, index: number) => {
                            return (
                                <div key={index} className="bg-primary-500 text-white rounded-md w-80 p-4 flex flex-col  hover:scale-105 transition-all">

                                    <p className="text-3xl text-center font-bold">
                                        {val.licenseType}
                                    </p>

                                    <p className="text-2xl text-center font-bold">
                                        {val.paymentAmount}/MONTH
                                    </p>
                                    <p className="text-2xl my-2 text-center font-bold">&#x2756; &#x2756; &#x2756;</p>


                                    <p className="text-xl font-normal my-1">
                                        <span className="text-secondary pr">&#x2756;</span> {val.projectPerLicense} Projects
                                    </p>

                                    <p className="text-xl font-normal my-1">
                                        <span className="text-secondary pr">&#x2756;</span> {val.questionAllowed} Questions.
                                    </p>
                                    {val.id == 1 ? null :
                                        <div className="bg-secondary bg-opacity-20 border-2 border-secondary rounded-md p px-4 mt-4">
                                            <p className="font-semibold text-xl my-1 text-secondary">
                                                {val.discountAmount} Discount
                                            </p>

                                            <p className="font-normal text-lg my-1 text-secondary">
                                                {new Date(val.discountValidTill).toDateString()} Discount Valid
                                            </p>
                                        </div>
                                    }
                                    <div className="grow"></div>
                                    <div className="flex w-full gap-4 mt-2">
                                        <button
                                            onClick={() => {
                                                setLicenseBox(value => true);
                                                setLicenaseid((value: any) => val);
                                            }}
                                            className="py-1 text-white text-lg grow bg-green-500 text-center rounded-md font-medium"
                                        >
                                            Select
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
                <div className="h-20"></div>

            </div>
        </>
    );
}

export default license;