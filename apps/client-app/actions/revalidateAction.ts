
"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { decodeToken } from "../utils/decodeToken";


interface TagType{
    tag?: string[];
    path?: string;
}
export async function revalidateTagPathAction({tag = [], path=""}: TagType){
    if (tag.length > 0) {
        tag.map((t) => {
            revalidateTag(t);
        })
    }
    if (path) {
        revalidatePath(path)
    }
    return;
}

//revalidation with userId

export async function revalidateWithUserId({tag = "", path=""}) {
    const userId = await decodeToken();
    if(!userId) return;

    if(tag) {
        revalidateTag(`${tag}-${userId}`)
    }
    if (path){
        revalidatePath(`${path}-${userId}`)
    }
    return;
}