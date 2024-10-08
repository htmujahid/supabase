import { useMemo, useRef, useState } from 'react'

import { getHasInstalledObject } from 'components/layouts/IntegrationsLayout/Integrations.utils'
import PartnerIcon from 'components/ui/PartnerIcon'
import { useIntegrationsQuery } from 'data/integrations/integrations-query'
import type { IntegrationName } from 'data/integrations/integrations.types'
import { useOrganizationsQuery } from 'data/organizations/organizations-query'
import type { Organization } from 'types'
import {
  Badge,
  Button,
  CommandEmpty_Shadcn_,
  CommandGroup_Shadcn_,
  CommandInput_Shadcn_,
  CommandItem_Shadcn_,
  CommandList_Shadcn_,
  Command_Shadcn_,
  PopoverContent_Shadcn_,
  PopoverTrigger_Shadcn_,
  Popover_Shadcn_,
  cn,
} from 'ui'
import { ChevronDown } from 'lucide-react'

export interface OrganizationPickerProps {
  integrationName: IntegrationName
  configurationId?: string
  selectedOrg: Organization | null
  onSelectedOrgChange: (organization: Organization) => void
  disabled?: boolean
}

const OrganizationPicker = ({
  integrationName,
  configurationId,
  selectedOrg,
  onSelectedOrgChange,
  disabled,
}: OrganizationPickerProps) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLButtonElement>(null)

  const { data: integrationData } = useIntegrationsQuery()
  const { data: organizationsData, isLoading: isLoadingOrganization } = useOrganizationsQuery()

  const installed = useMemo(
    () =>
      integrationData && organizationsData
        ? getHasInstalledObject({
            integrationName,
            integrationData,
            organizationsData,
            installationId: configurationId,
          })
        : {},
    [configurationId, integrationData, integrationName, organizationsData]
  )

  return (
    <>
      <Popover_Shadcn_ open={open} onOpenChange={setOpen}>
        <PopoverTrigger_Shadcn_ asChild>
          <Button
            ref={ref}
            type="default"
            size="medium"
            block
            className="justify-start"
            loading={isLoadingOrganization}
            disabled={disabled}
            iconRight={
              <span className="grow flex justify-end">
                <ChevronDown />
              </span>
            }
          >
            <div className="flex gap-2">
              <span className={cn('truncate', !selectedOrg && 'text-foreground-light')}>
                {selectedOrg?.name ? selectedOrg?.name : 'Choose an organization'}
              </span>
              {selectedOrg && configurationId && installed[selectedOrg.slug] && (
                <Badge>Integration Installed</Badge>
              )}
            </div>
          </Button>
        </PopoverTrigger_Shadcn_>
        <PopoverContent_Shadcn_
          className="p-0 w-full"
          side="bottom"
          align="center"
          style={{ width: ref.current?.offsetWidth }}
        >
          <Command_Shadcn_>
            <CommandInput_Shadcn_ placeholder="Search organizations..." />
            <CommandList_Shadcn_>
              <CommandEmpty_Shadcn_>No results found.</CommandEmpty_Shadcn_>
              <CommandGroup_Shadcn_>
                {organizationsData?.map((org) => {
                  return (
                    <CommandItem_Shadcn_
                      value={org.slug}
                      key={org.slug}
                      className="flex gap-2 items-center"
                      onSelect={(slug) => {
                        const org = organizationsData?.find(
                          (org) => org.slug.toLowerCase() === slug.toLowerCase()
                        )
                        if (org) {
                          onSelectedOrgChange(org)
                        }

                        setOpen(false)
                      }}
                    >
                      <PartnerIcon organization={org} />
                      <span className="truncate">{org.name}</span>{' '}
                      {configurationId && installed[org.slug] && (
                        <Badge className="!flex-none">Integration Installed</Badge>
                      )}
                    </CommandItem_Shadcn_>
                  )
                })}
              </CommandGroup_Shadcn_>
            </CommandList_Shadcn_>
          </Command_Shadcn_>
        </PopoverContent_Shadcn_>
      </Popover_Shadcn_>
    </>
  )
}

export default OrganizationPicker
