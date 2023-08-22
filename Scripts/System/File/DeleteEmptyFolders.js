/**
 * @name DeleteEmptyFolders - Delete Empty Folders
 * @description Reads a variable 'DeleteEmptyFolders' and iterates all folders defined there and will delete any empty folder found within, leaving the root folder
 * @revision 1
 * @minimumVersion 1.0.0.0
 */

let folders = Variables['DeleteEmptyFolders'];
if(!folders){
    Logger.WLog('DeleteEmptyFolders variable not defined.')
    return;
}

folders = folders.trim().split('\n');
if(!folders.length){
    Logger.WLog('DeleteEmptyFolders variable has no folders.')
    return;
}

let deleted = 0;
for(let folder of folders)
{
    folder = folder.trim();
    if(System.IO.Directory.Exists(folder) === false)
        continue;
    const cutoffDate =  new Date(Date.now() - 60 * 60 * 1000);
    for(let sub of System.IO.Directory.GetDirectories(folder))
    {
        let subdir = new System.IO.DirectoryInfo(sub);
        
        if (subdir.LastWriteTime > cutoffDate || subdir.CreationTime > cutoffDate)
        {
            Logger.ILog('Directory was written/created recently: ' + sub);
            continue;
        }
        
        var files = subdir.GetFiles("*", System.IO.SearchOption.AllDirectories);
        let count = files.length;
        Logger.ILog(`Checking sub directory [${count} files]: ${sub}`);
        if(isNaN(count) || count > 0)
            continue;
        Logger.ILog('Deleting empty folder: '+ sub);
        try
        {
            subdir.Delete(true);
            deleted++;
        }
        catch(err)
        {
            Logger.ELog('Failed to delete directory: ' + err);
        }
    }
}

Logger.ILog(`Done, deleted ${deleted} folders`);