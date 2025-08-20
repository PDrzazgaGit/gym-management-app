export class OtherApi {
    public static async openFolder(folderName: "db" | "log" | "config"): Promise<void>{
        return window.api.other.openFolder(folderName);
    }
}