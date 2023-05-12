import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LoaderArgs, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import axios from "axios";
import React, { useState } from "react";
import { userPrefs } from "~/cookies";
import { ApiCall } from "~/services/api";

import { ToastContainer, toast } from "react-toastify";

import styles from "react-toastify/dist/ReactToastify.css";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export async function loader(params: LoaderArgs) {
  const cookieHeader = params.request.headers.get("Cookie");
  const cookie: any = await userPrefs.parse(cookieHeader);
  const data = await ApiCall({
    query: `
    query getAllProject{
      getAllProject{
        id,
        name,
        description,
        status
      },
    }
  `,
    veriables: {},
    headers: { authorization: `Bearer ${cookie.token}` },
  });

  return json({ project: data.data.getAllProject, token: cookie.token });
}

const UserDashboard = () => {
  const loaderproject = useLoaderData().project;
  const token = useLoaderData().token;

  const [project, setProject] = useState<any[]>(loaderproject);

  const updateStatus = async (id: number, status: string) => {
    const data = await ApiCall({
      query: `
      mutation updateProjectById($updateProjectInput:UpdateProjectInput!){
        updateProjectById(updateProjectInput:$updateProjectInput){
          name,
          id
        }
      }
      `,
      veriables: {
        updateProjectInput: {
          id: id,
          status: status,
        },
      },
      headers: { authorization: `Bearer ${token}` },
    });

    if (data.status) {
      await updateProjects();
      toast.success("Status updated successfully", { theme: "light" });
    } else {
      toast.error(data.message, { theme: "light" });
    }
  };

  const updateProjects = async () => {
    const data = await ApiCall({
      query: `
      query getAllProject{
        getAllProject{
          id,
          name,
          description,
          status
        },
      }
    `,
      veriables: {},
      headers: { authorization: `Bearer ${token}` },
    });
    setProject((val) => data.data.getAllProject);
  };

  return (
    <>
      <div className="grow bg-[#272934] p-4 w-full overflow-x-hidden">
        <h1 className="text-white font-medium text-2xl">Project</h1>
        <div className="w-full bg-slate-400 h-[1px] my-2"></div>
        <div className="no-scrollbar w-full">
          <div className="bg-[#31353f]  rounded-md flex px-4 py-2 my-2 text-white font-medium text-md flex-nowrap">
            <div className="w-14">Id</div>
            <div className="grow"></div>
            <div className="w-44">Name</div>
            <div className="grow"></div>
            <div className="w-44">Description</div>
            <div className="grow"></div>
            <div className="w-24">Status</div>
          </div>
          {project == null || project == undefined ? (
            <>
              <p className="text-rose-500 font-semibold text-2xl my-4 rounded-md border-l-4 px-2 py-2 bg-rose-500 bg-opacity-20 border-rose-500 w-full">
                There is no project.
              </p>
            </>
          ) : (
            project.map((val: any, index: number) => {
              return (
                <div
                  key={index}
                  className="bg-[#31353f] hover:bg-opacity-60 rounded-md flex px-4 py-2 my-2 text-white font-medium text-md flex-nowrap"
                >
                  <div className="w-14">{val.id}</div>
                  <div className="grow"></div>
                  <div className="w-44">{val.name}</div>
                  <div className="grow"></div>
                  <div className="w-44">{val.description}</div>
                  <div className="grow"></div>
                  <div className="w-24 grid place-items-center cursor-pointer">
                    {val.status == "ACTIVE" ? (
                      <div
                        onClick={() => updateStatus(val.id, "INACTIVE")}
                        className="w-16 py-1 text-white text-xs bg-green-500 text-center rounded-md font-medium"
                      >
                        ACTIVE
                      </div>
                    ) : (
                      <div
                        onClick={() => updateStatus(val.id, "ACTIVE")}
                        className="w-16 py-1 text-white text-xs bg-rose-500 text-center rounded-md font-medium"
                      >
                        INACTIVE
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      <ToastContainer></ToastContainer>
    </>
  );
};

export default UserDashboard;
