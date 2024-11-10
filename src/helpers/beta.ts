import {getCacheExecData} from 'src/scripts/cache/cache';

import {Logger} from './logger';

export async function getBetaVersionData(component: string) {
  const data = await getCacheExecData<string>(
    `npm view ${component} dist-tags --json`,
    `Fetching ${component} tags`
  );

  return data;
}

export async function getBetaVersion(component: string) {
  const data = await getBetaVersionData(component);

  try {
    return JSON.parse(data).beta;
  } catch (error) {
    Logger.error(`Get beta version error: ${error}`);
    process.exit(1);
  }
}

/**
 * @example Input: ["drawer"]
 * 
 * Return:
 * {
    "name": "drawer",
    "package": "@nextui-org/drawer",
    "version": "2.1.0-beta.3",
    "docs": "https://nextui.org/docs/components/drawer",
    "description": "Used to render a content that slides in from the side of the screen.",
    "status": "new",
    "style": "",
    "peerDependencies": {
      "react": ">=18 || >=19.0.0-rc.0",
      "react-dom": ">=18 || >=19.0.0-rc.0",
      "@nextui-org/theme": ">=2.3.0-beta.0",
      "@nextui-org/system": ">=2.3.0-beta.0",
      "tailwindcss": ">=3.4.0"
    }
 */
// export async function getBetaComponents(
//   components?: string[],
//   updatedComponents?: ComponentsJson['components']
// ) {
//   const componentsDataList = [] as ComponentsJson['components'];

//   // Get the list of beta components that are not in the updated components
//   const betaList = await checkIllegalComponents(components, true, true, updatedComponents);

//   if (betaList.length) {
//     try {
//       const latestCoreVersion = await getBetaVersionData(NEXT_UI);
//       const latestBetaVersion = JSON.parse(latestCoreVersion).beta;
//       const latestBetaComponentsData = await autoUpdateComponents(latestBetaVersion);

//       for (const missingBetaComponent of betaList) {
//         const missingBetaComponentData = latestBetaComponentsData.components.find(
//           (data) => data.package === missingBetaComponent
//         );

//         missingBetaComponentData && componentsDataList.push(missingBetaComponentData);
//       }
//     } catch (error) {
//       Logger.error(`Get latest beta version error: ${error}`);
//     }
//   }

//   return componentsDataList;
// }
