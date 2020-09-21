import * as React from 'react'
import {
  useConnectionState,
  useDocumentOperation,
  useEditState,
  useValidationStatus
} from '@sanity/react-hooks'
import schema from 'part:@sanity/base/schema'
import {MenuItemType, MenuItemGroupType} from 'part:@sanity/components/menus/default'
import {getPublishedId} from 'part:@sanity/base/util/draft-utils'
import {CodeBlock} from '../../components/CodeBlock'
import withInitialValue from '../../utils/withInitialValue'
import ErrorPane from '../errorPane/ErrorPane'
import {LoadingPane} from '../loadingPane'
import {DocumentHistoryProvider} from './documentHistory'
import {DocumentPane} from './documentPane'
import {Doc, DocumentPaneOptions} from './types'
import {getInitialValue} from './utils/value'

declare const __DEV__: boolean

interface Props {
  title?: string
  paneKey: string
  type: any
  isLoading: boolean
  isSelected: boolean
  isCollapsed: boolean
  onChange: (patches: any[]) => void
  isClosable: boolean
  onExpand?: () => void
  onCollapse?: () => void
  menuItems: MenuItemType[]
  menuItemGroups: MenuItemGroupType[]
  views: {
    type: string
    id: string
    title: string
    options: Record<string, unknown>
    component: React.ComponentType<any>
  }[]
  initialValue?: Doc
  options: DocumentPaneOptions
}

// eslint-disable-next-line complexity
export const DocumentPaneProvider = withInitialValue((props: Props) => {
  const documentIdRaw = props.options.id
  const documentId = getPublishedId(documentIdRaw)
  const documentTypeName = props.options.type
  const {patch}: any = useDocumentOperation(documentIdRaw, documentTypeName)
  const editState: any = useEditState(documentIdRaw, documentTypeName)
  const {markers} = useValidationStatus(documentIdRaw, documentTypeName)
  const connectionState = useConnectionState(documentIdRaw, documentTypeName)
  const schemaType = schema.get(documentTypeName)

  const onChange = React.useCallback(
    patches => {
      patch.execute(patches, props.initialValue)
    },
    [patch]
  )

  if (!schemaType) {
    const value = editState && (editState.draft || editState.published)

    return (
      <ErrorPane
        {...props}
        color="warning"
        title={
          <>
            Unknown document type: <code>{documentTypeName}</code>
          </>
        }
      >
        {documentTypeName && (
          <p>
            This document has the schema type <code>{documentTypeName}</code>, which is not defined
            as a type in the local content studio schema.
          </p>
        )}
        {!documentTypeName && (
          <p>This document does not exist, and no schema type was specified for it.</p>
        )}
        {__DEV__ && value && (
          <div>
            <h4>Here is the JSON representation of the document:</h4>
            <CodeBlock>{JSON.stringify(value, null, 2)}</CodeBlock>
          </div>
        )}
      </ErrorPane>
    )
  }

  if (connectionState === 'connecting' || !editState) {
    return <LoadingPane {...props} delay={600} title={`Loading ${schemaType.title}…`} />
  }

  const initialValue = getInitialValue({initialValue: props.initialValue, options: props.options})
  const value = editState.draft || editState.published || initialValue

  return (
    <DocumentHistoryProvider documentId={documentId} value={value}>
      <DocumentPane
        connectionState={connectionState}
        documentId={documentId}
        documentIdRaw={documentIdRaw}
        documentType={documentTypeName}
        draft={editState.draft}
        initialValue={initialValue}
        isClosable={props.isClosable}
        isCollapsed={props.isCollapsed}
        isSelected={props.isSelected}
        markers={markers}
        menuItemGroups={props.menuItemGroups}
        onChange={onChange}
        paneKey={props.paneKey}
        published={editState.published}
        schemaType={schemaType}
        value={value}
        compareValue={editState.published}
        views={props.views}
      />
    </DocumentHistoryProvider>
  )
})
