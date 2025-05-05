$targetFolder = "C:\temp\MPXmls"
Set-Location -Path $targetFolder 

$List_MP = "List_MP.xml"
Remove-Item -Path ".\*" -Recurse -Force

#region generate MP XMLs from SQLs
$result = Invoke-Sqlcmd -ServerInstance sql2017 -Database operationsmanager -Query "select MPName, mpxml, MPVersion from managementpack where MPKeyToken='31bf3856ad364e35'"  -MaxCharLength 100MB
foreach($mpxml in $result) {
    $newFolder = [System.IO.Path]::Combine($targetFolder, $mpxml["MPName"], $mpxml["MPVersion"])
    New-Item -Path $newFolder -ItemType Directory -ErrorAction SilentlyContinue | Out-Null
    $outputFilePath = [System.IO.Path]::Combine($targetFolder, $mpxml["MPName"], $mpxml["MPVersion"], "MP.xml")
    $mpxml["mpxml"] | Out-File -FilePath $outputFilePath -Encoding UTF8
    $outputFilePath
}

$result = Invoke-Sqlcmd -ServerInstance sql2019 -Database operationsmanager -Query "select MPName, mpxml, MPVersion from managementpack where MPKeyToken='31bf3856ad364e35'"  -MaxCharLength 100MB
foreach($mpxml in $result) {
    $newFolder = [System.IO.Path]::Combine($targetFolder, $mpxml["MPName"], $mpxml["MPVersion"])
    New-Item -Path $newFolder -ItemType Directory -ErrorAction SilentlyContinue | Out-Null
    $outputFilePath = [System.IO.Path]::Combine($targetFolder, $mpxml["MPName"], $mpxml["MPVersion"], "MP.xml")
    $mpxml["mpxml"] | Out-File -FilePath $outputFilePath -Encoding UTF8
    $outputFilePath
}

#endregion 


$mpList = @{}
$mpFolders = Get-ChildItem 
foreach($mpFolder in $mpFolders) {
    $mpInfo = @{}

    $mpVersionFolders = Get-ChildItem $mpFolder
    $mpVersions = @()
    $list_MPVersion = @()
    foreach($mpVersionFolder in $mpVersionFolders) {
        $mpVersions += [version]::new($mpVersionFolder.Name)

        #region To help GitHub code search
        "$mpFolder $mpVersionFolder"

        $mpPathMP = [System.IO.Path]::Combine((Get-Location).Path, $mpFolder.Name, $mpVersionFolder.Name, "MP.xml")
        $mpFileSize = (Get-Item $mpPathMP).Length  # Get the size of the MP.xml file in bytes
        $lines = Get-Content -Path $mpPathMP  # Read the file line by line

        # Check if the file size is less than 340 KB and no line exceeds 1000 characters
        if ($mpFileSize -lt (340 * 1000) -and ( $lines | ForEach-Object { $_.Length } | Where-Object { $_ -gt 1000 } | Measure-Object).Count -eq 0 ) {
            Write-Host "Skipping .part file creation for $($mpFolder.Name) version $($mpVersionFolder.Name) as the file size is less than 340 KB and no line exceeds 1000 characters." -ForegroundColor Yellow
            continue
        }

        # Initialize variables for splitting
        $chunkCounter = 1
        $currentFileSize = 0
        $chunkFilePath = [System.IO.Path]::Combine((Get-Location).Path, $mpFolder.Name, $mpVersionFolder.Name, "MP$chunkCounter.part")
        $streamWriter = [System.IO.StreamWriter]::new($chunkFilePath, $false, [System.Text.Encoding]::UTF8)

        # Process the XML line by line
        foreach ($line in $lines) {
            # Split the line into chunks of up to 1000 characters, ensuring no word is broken
            $remainingLine = $line
            while ($remainingLine.Length -gt 0) {
                if ($remainingLine.Length -le 1000) {
                    # If the remaining line is within 1000 characters, write it as is
                    $lineChunk = $remainingLine
                    $remainingLine = ""
                } else {
                    # Find the last space within the first 1000 characters
                    $chunk = $remainingLine.Substring(0, 1000)
                    $lastSpaceIndex = $chunk.LastIndexOf(" ")
                    if ($lastSpaceIndex -gt -1) {
                        # Break at the last space
                        $lineChunk = $remainingLine.Substring(0, $lastSpaceIndex)
                        $remainingLine = $remainingLine.Substring($lastSpaceIndex + 1)  # Skip the space
                    } else {
                        # No space found, break at 1000 characters
                        $lineChunk = $chunk
                        $remainingLine = $remainingLine.Substring(1000)
                    }
                }

                # Add a line ending to the chunk
                $formattedChunk = $lineChunk + "`r`n"
                $chunkSizeInBytes = [System.Text.Encoding]::UTF8.GetByteCount($formattedChunk)

                if (($currentFileSize + $chunkSizeInBytes) -gt (340 * 1000)) {
                    # Close the current file and start a new one
                    $streamWriter.Close()
                    $chunkCounter++
                    $chunkFilePath = [System.IO.Path]::Combine((Get-Location).Path, $mpFolder.Name, $mpVersionFolder.Name, "MP$chunkCounter.part")
                    $streamWriter = [System.IO.StreamWriter]::new($chunkFilePath, $false, [System.Text.Encoding]::UTF8)
                    $currentFileSize = 0
                }

                # Write the chunk to the current file
                $streamWriter.Write($formattedChunk)
                $currentFileSize += $chunkSizeInBytes
            }
        }

        # Close the last file
        $streamWriter.Close()

        #region Verify .part files
        if ($false) { # skip verification
            # Get all .part files in the current version folder, sorted by name
            $partFiles = Get-ChildItem -Path ([System.IO.Path]::Combine((Get-Location).Path, $mpFolder.Name, $mpVersionFolder.Name)) -Filter "MP*.part" | Sort-Object Name

            # Read and join the contents of all .part files
            $reassembledXml = ""
            foreach ($partFile in $partFiles) {
                $fileContent = Get-Content -Path $partFile.FullName
                $reassembledXml += ($fileContent -join "`r`n")  # Join lines with CRLF
            }

            # Compare the reassembled XML with the original file content
            $originalXml = (Get-Content -Path $mpPathMP) -join "`r`n"  # Join original lines with CRLF
            if ($reassembledXml -eq $originalXml) {
                Write-Host "Verification successful: The reassembled XML matches the original XML for $($mpFolder.Name) version $($mpVersionFolder.Name)." -ForegroundColor Green
            } else {
                Write-Error "Verification failed: The reassembled XML does not match the original XML for $($mpFolder.Name) version $($mpVersionFolder.Name)."
            }
        }
        #endregion
        #endregion        
            
    }
    $list_MPVersion_Content = "<List>`n"
    $sortedMpVersions = $mpVersions | Sort-Object
    foreach($sortedMpVersion in $sortedMpVersions) {
        $list_MPVersion_Content += "`n<MPVersion Version='$($sortedMpVersion.ToString())' />"
    }
    $list_MPVersion_Content += "`n</List>"
    $list_MPVersion_Content | Out-File -FilePath ([System.IO.Path]::Combine($targetFolder, $mpFolder, "List_MPVersion.xml")) -Encoding UTF8

    $maxMpVersion = $mpVersions | Sort-Object -Descending | Select-Object -First 1
    $mpInfo.Add("LatestVersion", $maxMpVersion.ToString())

    [xml]$xmlDoc = [xml]::new()
    $mpPath = [System.IO.Path]::Combine( (Get-Location).Path , $mpFolder.Name, $maxMpVersion.ToString(), "MP.xml")
    $xmlDoc.Load($mpPath)
    $mpDisplayName = ""
    $mpDescription = ""
    $mpDisplayStringNode = $xmlDoc.DocumentElement.SelectSingleNode("/ManagementPack/LanguagePacks/LanguagePack[@ID='ENU']/DisplayStrings/DisplayString[@ElementID='$($mpFolder.Name)']")
    if ($mpDisplayStringNode) {
        $mpDisplayName = $mpDisplayStringNode.Name
        $mpDescription = $mpDisplayStringNode.Description
    }
    if ($mpDisplayName -eq "") {
        $mpFriendlyNameNode = $xmlDoc.DocumentElement.SelectSingleNode('/ManagementPack/Manifest/Name')
        if ($mpFriendlyNameNode) {
            $mpDisplayName = $mpFriendlyNameNode.InnerText
        }
    }
    $mpInfo.Add("Name", $mpDisplayName )
    $mpInfo.Add("Description", $mpDescription )

    $mpList.Add($mpFolder.Name, $mpInfo)
}

$sortedMPs = $mpList.GetEnumerator() | Sort-Object Key
$List_MP_Content = "<List>`n"
foreach($mp in $sortedMPs) {
    $List_MP_Content += "`n<ManagementPack ID='$($mp.Key.ToString())' LatestVersion='$($mp.Value['LatestVersion'])' Name='$($mp.Value['Name'])' Description='$($mp.Value['Description'])' />"
}
$List_MP_Content += "`n</List>"
$List_MP_Content | Out-File -FilePath ([System.IO.Path]::Combine($targetFolder, $List_MP)) -Encoding UTF8